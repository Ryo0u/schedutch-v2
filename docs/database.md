# データモデル・RPC・セキュリティ

スキーマ・RLS・RPC は supabase CLI のマイグレーション（`supabase/migrations/`）でバージョン管理する。

## テーブル定義

拡張: `uuid-ossp` / `pgcrypto`（`extensions` スキーマ）。

### events

| 列 | 型 | 制約 |
|---|---|---|
| id | uuid | PK, default `uuid_generate_v4()` |
| title | text | NOT NULL |
| comment | text | |
| password_digest | text | クライアントには配信しない |
| created_at | timestamptz | default `now()` |

### candidates

| 列 | 型 | 制約 |
|---|---|---|
| id | uuid | PK |
| event_id | uuid | FK → events(id) ON DELETE CASCADE |
| start_time | timestamptz | NOT NULL |
| end_time | timestamptz | NOT NULL |
| index_number | integer | 表示順 |

### users

| 列 | 型 | 制約 |
|---|---|---|
| id | uuid | PK |
| event_id | uuid | FK → events(id) ON DELETE CASCADE |
| name | text | NOT NULL |
| comment | text | |
| password_digest | text | クライアントには配信しない |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | NOT NULL, default `now()`。`update_user_with_responses` の update で現在時刻に更新する。自動削除の「最終アクティビティ」判定に使う |

### responses

| 列 | 型 | 制約 |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users(id) ON DELETE CASCADE |
| candidate_id | uuid | FK → candidates(id) ON DELETE CASCADE |
| status | text | NOT NULL, CHECK (`'ok'` / `'ng'` / `'maybe'`) |
| time | timestamptz | NOT NULL。UNIQUE (user_id, candidate_id, time) |

## RLS / 権限

- 4 テーブルすべて RLS 有効。`anon` へのポリシーは `FOR SELECT USING (true)` のみで、INSERT / UPDATE / DELETE のポリシーは付与しない（直叩き write を全面封鎖。write は下記 RPC 経由のみ）。
- `password_digest` は列単位の GRANT で anon の SELECT 対象から除外する（`20260705041653_fix_column_grants.sql`）:
  - events: `id, title, comment, created_at` のみ SELECT 可
  - users: `id, event_id, name, comment, created_at, updated_at` のみ SELECT 可
  - candidates / responses: 全列 SELECT 可
- 注意: `select("*")` は権限のない列が 1 つでもあるとクエリ全体が拒否されるため、取得クエリ（`features/event-detail/api/eventApi.ts` の `getEvent`）は列を明示指定する。
- 注意: `20260705041653` で列単位 revoke を行って以降、`events` / `users` はテーブルレベル GRANT が列ごとの明示 GRANT に分解されている。**この 2 テーブルに列を追加しても anon / authenticated には自動で SELECT 権限が付かない**。列追加時は同じマイグレーションに `grant select ("新列") on ... to anon, authenticated;` を書く（例: `20260829130000_grant_select_users_updated_at.sql`）。

## RPC 関数

すべて SECURITY DEFINER（`search_path = public, extensions`）。EXECUTE 権限は `anon, authenticated, service_role` に付与（`delete_expired_events` のみ `service_role` 限定）。パスワード照合は RPC 内で `extensions.crypt(平文, digest) = digest` により行う。

| 関数 | 引数 | 戻り値 | 挙動 |
|---|---|---|---|
| `create_event_with_candidates` | `p_title, p_password, p_comment, p_candidates jsonb` | uuid | イベントと候補日をトランザクションで作成し event id を返す |
| `save_user_responses` | `p_event_id, p_name, p_comment, p_password, p_response_data jsonb` | json `{user_id}` | candidate_id が当該イベント所属かを検証したうえで、ユーザーと回答を一括作成 |
| `update_event` | `p_event_id, p_password, p_title, p_comment` | void | イベントパスワード照合 → タイトル・コメント更新 |
| `update_user_with_responses` | `p_user_id, p_password, p_name, p_comment, p_response_data jsonb` | void | 本人パスワード照合 + candidate 所属検証 → ユーザー更新・回答を洗い替え |
| `delete_event` | `p_event_id, p_password` | void | イベントパスワード照合 → イベント一式を削除 |
| `delete_user` | `p_user_id, p_password` | void | **本人 or イベントパスワードのいずれか一致**で参加者を削除 |
| `verify_user_password` | `p_user_id, p_password` | boolean | 編集ダイアログを開く前の事前検証。例外を投げず真偽値を返す（digest が NULL なら false） |
| `delete_expired_events` | なし | integer（削除件数） | **`service_role` 限定・パスワード照合なし**。放置イベントを一括削除する（下記「自動削除」） |

### エラーコード（SQLSTATE）

RPC は、クライアントがユーザーの取るべき行動で分類できるよう、業務エラーに独自の SQLSTATE を付けて例外を投げる。PostgREST はこれを JSON の `code` にそのまま載せ（HTTP 400）、クライアントは `lib/rpcErrors.ts` の `classifyError()` で分類する。

| SQLSTATE | 意味 | 投げる RPC |
|---|---|---|
| `PWD01` | パスワード不一致 | `update_event` / `delete_event` / `update_user_with_responses` / `delete_user` |
| `NTF01` | 操作対象（イベント・参加者）が存在しない | `update_event` / `delete_event` / `save_user_responses` / `update_user_with_responses` / `delete_user` |
| `CNF01` | 他の人の更新と競合した（予定の時間帯の重なり・参加できないメンバーを含む） 
「不正な候補日/回答時刻/参加者」「開始時刻は終了時刻より前」「候補日の時間帯から外れた」など、UI 側で入力を防いでいる値の検証は errcode を付けず `P0001` のまま投げる。通常の操作では起きず、起きたらバグか改ざんのため、クライアントでは想定外として扱う。

`save_user_responses` / `create_event_with_candidates` は末尾の `exception when others` で例外を投げ直す。`save_user_responses` は `using errcode = sqlstate` で元の SQLSTATE を引き継ぐ（付けないと `P0001` に上書きされ、`NTF01` が届かない）。

## 自動削除

放置されたイベントを `delete_expired_events()` で定期削除する。Vercel Cron（`app/api/cron/delete-expired-events/route.ts` + `vercel.json`）が1日1回叩く。本番 Supabase（無料プラン）の自動停止対策（write を発生させる keep-alive）も兼ねる。

削除条件（どちらか該当したら削除。`events` の削除で candidates / users / responses は FK CASCADE で連鎖削除される）:

| 状態 | 保持期間 | 起点 |
|---|---|---|
| 回答者ゼロ | 60 日 | `events.created_at` |
| 回答者あり | 30 日 | `max(users.updated_at)`（最終アクティビティ） |

日数は `features/event-detail/lib/deletion.ts` の `EVENT_RETENTION_DAYS_*` と RPC の `interval` を対応させる。イベント詳細画面（`EventInfo`）は同じロジックで削除予定日を表示する。

Cron 経路は `CRON_SECRET`（Vercel が Cron リクエストに付与する Bearer トークンを検証）と `SUPABASE_SERVICE_ROLE_KEY`（`service_role` 限定 RPC を叩くため）を使う。

## パスワードの取り扱い

- **保存**: 作成系 RPC（`create_event_with_candidates` / `save_user_responses`）が平文を受け取り、`extensions.crypt(平文, extensions.gen_salt('bf', 10))` でハッシュ化して保存する。クライアントはハッシュ化しない。
- **照合**: サーバー（RPC 内 `crypt()`）側でのみ行う。`password_digest` はクライアントに一切配信しない（型にも持たせない）。
- **不一致エラー**: パスワード不一致時、RPC は SQLSTATE **`PWD01`** の例外を投げる（→ [エラーコード](#エラーコードsqlstate)）。クライアントは `isPasswordError()`（`lib/rpcErrors.ts`）で判定してエラー表示にマッピングする。`verify_user_password` は真偽値を返すため、呼び出し側で `createPasswordMismatchError()` により同じ分類に載せる。

## 時刻の扱い

- DB には UTC（timestamptz）で保存する。
- 表示時は `lib/datetime.ts` の `formatJSTTime` / `formatJSTDate` / `formatJSTCandidateDateLabel`（候補日ラベル用の `formatJSTDate` ラッパー）/ `toJSTDateString` で JST に変換する（ブラウザのタイムゾーンに依存しない実装）。
- 入力時（候補日の作成）は `jstWallTimeToISO(date, "HH:MM")` で JST 壁時計 → UTC の ISO 文字列に変換する。
- 時刻の刻みは全画面共通で 30 分（`lib/constants.ts` の `TIME_OPTIONS`: 00:00〜23:30 の 48 件）。
