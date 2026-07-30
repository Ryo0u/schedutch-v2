# イベント閲覧・回答（`/event/[id]`）

実装: `features/event-detail/`（コンテナ: `components/EventContainer.tsx`）

## ページ構成

`EventContainer` が `useEvent`（TanStack Query）でイベント一式（events + candidates + users + responses の結合クエリ）を取得する。ロード中は `EventSkeleton`、失敗時はエラーメッセージを表示する。

各セクションは `data` を prop で受け取らず、`eventId` を受けて自身で `useEvent` する（キャッシュ共有により再フェッチは起きない）。

| セクション | 実装 | 内容 |
|---|---|---|
| イベント情報 | `components/event/EventInfo.tsx` | タイトル・コメント・日付範囲・候補日件数・回答者数 |
| 参加者一覧 | `components/users/UsersInfo.tsx` | 回答者の一覧と編集・削除の入り口 |
| 予定一覧 | `components/responses/ResponsesInfo.tsx` | 全員の回答をグリッド表示 |
| 予定抽出 | `components/extract/ExtractResponses.tsx` | 条件抽出（→ [extract.md](extract.md)） |

予定一覧と予定抽出は `ExtractSlotsProvider`（Context）で包まれ、抽出結果のハイライト状態を共有する。画面幅 lg 以上ではサイドナビ（`EventSideNav`）を表示する。本文と同じ `flex` コンテナ内で `sticky` 配置され、本文の左に並ぶ。

## 回答フロー（新規参加）

`components/responses/JoinButton.tsx` →「予定を回答する」→ `ResponsesForm.tsx`（ダイアログ）。

1. **参加者情報**（`components/form/InputUserInfo.tsx`）: 名前・コメント・パスワードを入力。
   - バリデーション（`schema.ts` の `UserFormSchema`）: 名前 1〜10 文字 / コメント 30 文字以内 / パスワード 3〜12 文字。
2. **回答グリッド**（`components/form/InputResponses.tsx`）: ダイアログを開くと候補日ごとに `start_time`〜`end_time` を 30 分刻みで展開し、全スロットを `status: "ok"` で初期化する。
3. 送信: パスワードを `hashPassword` でハッシュ化し、RPC `save_user_responses` でユーザーと回答をまとめて保存する。

### 回答グリッドの操作（新規・編集で共用）

- 上部の `ToggleGroup` で塗るステータスを選択: `ok` = 参加（⚫︎ 青）/ `maybe` = 未定（▲ 黄）/ `ng` = 不参加（✖︎ 灰）。
- 候補日ごとのテーブルに `TIME_OPTIONS` の 30 分刻みで列が並び、候補の時間範囲外のセルは無効表示。
- PC はマウスドラッグ、スマホはタッチスワイプ（`elementFromPoint` + `data-index` でセル特定）で連続して塗れる。

## 参加者の編集・削除

編集フローは「事前検証 → 検証済み平文の引き回し → 更新 RPC で再検証」の 3 段階（パスワード照合は常にサーバー側）。

1. `UsersEditPasswordDialog`: 本人パスワードを入力し、RPC `verify_user_password` で事前検証する（真偽値を返す read 用途）。
2. 検証 OK なら平文パスワードを親コンポーネントが保持し、`UsersEditDialog` を開く。
3. 名前・コメント・回答を編集し、RPC `update_user_with_responses` で更新する（RPC 内で再照合。回答は全削除 → 洗い替え insert）。

削除は 2 経路あり、どちらも RPC `delete_user`（**本人パスワード or イベントパスワードのいずれか一致**で削除可）:

- 参加者行のゴミ箱ボタン → `UserDeleteDialog`（本人による削除を想定）
- 幹事メニュー → `UsersDeleteDialog`（パスワード入力 + ラジオで対象参加者を選択）

## 幹事用メニュー（`components/event/MenuButton.tsx`）

ドロップダウンから以下を実行できる。パスワード付き操作の不一致エラーは `isPasswordError()`（SQLSTATE `PWD01` 判定）でフィールドエラーにマッピングする。

| 操作 | ダイアログ | RPC | 備考 |
|---|---|---|---|
| イベント編集 | `EventEditDialog` | `update_event` | タイトル・コメントを編集用パスワードで更新 |
| 共有 | `EventShareDialog` | — | 現在の URL を表示・クリップボードコピー |
| イベント削除 | `EventDeleteDialog` | `delete_event` | イベント一式を削除し、成功で `/` へ遷移 |
| 参加者削除 | `UsersDeleteDialog` | `delete_user` | 上記参照 |

## データ更新パターン

mutation は `hooks/useEventMutations.ts` の hook（`useSaveResponses` / `useUpdateUser` / `useDeleteUser` / `useDeleteEvent`）を使う。成功時に hook 内で `eventKeys.detail(eventId)` を `invalidateQueries` するため、`onSuccess` / `refresh` の prop drilling は行わない。
