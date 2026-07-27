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
  - users: `id, event_id, name, comment, created_at` のみ SELECT 可
  - candidates / responses: 全列 SELECT 可
- 注意: `select("*")` は権限のない列が 1 つでもあるとクエリ全体が拒否されるため、取得クエリ（`features/event-detail/api/eventApi.ts` の `getEvent`）は列を明示指定する。

## RPC 関数

すべて SECURITY DEFINER（`search_path = public, extensions`）。EXECUTE 権限は `anon, authenticated, service_role` に付与。パスワード照合は RPC 内で `extensions.crypt(平文, digest) = digest` により行う。

| 関数 | 引数 | 戻り値 | 挙動 |
|---|---|---|---|
| `create_event_with_candidates` | `p_title, p_password_digest, p_comment, p_candidates jsonb` | uuid | イベントと候補日をトランザクションで作成し event id を返す |
| `save_user_responses` | `p_event_id, p_name, p_comment, p_password, p_response_data jsonb` | json `{user_id}` | candidate_id が当該イベント所属かを検証したうえで、ユーザーと回答を一括作成 |
| `update_event` | `p_event_id, p_password, p_title, p_comment` | void | イベントパスワード照合 → タイトル・コメント更新 |
| `update_user_with_responses` | `p_user_id, p_password, p_name, p_comment, p_response_data jsonb` | void | 本人パスワード照合 + candidate 所属検証 → ユーザー更新・回答を洗い替え |
| `delete_event` | `p_event_id, p_password` | void | イベントパスワード照合 → イベント一式を削除 |
| `delete_user` | `p_user_id, p_password` | void | **本人 or イベントパスワードのいずれか一致**で参加者を削除 |
| `verify_user_password` | `p_user_id, p_password` | boolean | 編集ダイアログを開く前の事前検証。例外を投げず真偽値を返す（digest が NULL なら false） |

## パスワードの取り扱い

- **保存**: 作成時（イベント・参加者とも）にクライアントで `bcryptjs` によりハッシュ化してから保存する（`lib/password.ts` の `hashPassword`）。`pgcrypto` の `crypt()` が `$2b$` プレフィックスを解釈できないため、`$2a$` に正規化する。
- **照合**: サーバー（RPC 内 `crypt()`）側でのみ行う。クライアントで `bcrypt.compare` はしない。`password_digest` はクライアントに一切配信しない（型にも持たせない）。
- **不一致エラー**: パスワード不一致時、RPC は SQLSTATE **`PWD01`** の例外を投げる（`20260705051246_use_errcode_for_password_mismatch.sql`）。クライアントは `isPasswordError()`（`features/event-detail/api/eventApi.ts`）で `error.code === 'PWD01'` を判定してエラー表示にマッピングする。`verify_user_password` は真偽値を返すため、呼び出し側で `createPasswordMismatchError()` により同じ分類に載せる。

## 時刻の扱い

- DB には UTC（timestamptz）で保存する。
- 表示時は `lib/datetime.ts` の `formatJSTTime` / `formatJSTDate` / `formatJSTCandidateDateLabel`（候補日ラベル用の `formatJSTDate` ラッパー）/ `toJSTDateString` で JST に変換する（ブラウザのタイムゾーンに依存しない実装）。
- 入力時（候補日の作成）は `jstWallTimeToISO(date, "HH:MM")` で JST 壁時計 → UTC の ISO 文字列に変換する。
- 時刻の刻みは全画面共通で 30 分（`lib/constants.ts` の `TIME_OPTIONS`: 00:00〜23:30 の 48 件）。
