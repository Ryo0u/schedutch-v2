# イベント閲覧・回答（`/event/[id]`）

実装: `features/event-detail/`（コンテナ: `components/EventContainer.tsx`）

## ページ構成

`EventContainer` が `useEvent`（TanStack Query）でイベント一式（events + candidates + users + responses の結合クエリ）を取得する。ロード中は `EventSkeleton`、失敗時はエラーメッセージを表示する。

埋め込みリレーションの並び順はクエリ側で明示する。候補日は `start_time` 昇順、参加者は `created_at` 昇順。PostgREST は `order` 指定が無い場合の順序を保証しないため、これが無いと予定一覧・サイドナビカレンダー・回答グリッドの表示順が不定になる。候補日に `index_number`（追加順）を使わないのは、作成画面の候補日一覧が日付昇順で表示されており、詳細画面と並びがズレるため。

各セクションは `data` を prop で受け取らず、`eventId` を受けて自身で `useEvent` する（キャッシュ共有により再フェッチは起きない）。

| セクション | 実装 | 内容 |
|---|---|---|
| イベント情報 | `components/event/EventInfo.tsx` | タイトル・コメント・日付範囲・候補日件数・回答者数 |
| 参加者一覧 | `components/users/UsersInfo.tsx` | 回答者の一覧と編集・削除の入り口 |
| 予定一覧 | `components/responses/ResponsesInfo.tsx` | 全員の回答をグリッド表示 |
| 予定抽出 | `components/extract/ExtractPanel.tsx` | 条件抽出（→ [extract.md](extract.md)） |

予定一覧と予定抽出は `ExtractSlotsProvider`（Context）で包まれ、抽出結果のハイライト状態を共有する。画面幅 lg 以上ではサイドナビ（`EventSideNav`）を表示する。本文と同じ `flex` コンテナ内で `sticky` 配置され、本文の左に並ぶ。

サイドナビの「予定一覧」アコーディオンを開くと、候補日一覧を `CandidateList.tsx` がカレンダー形式（`components/ui/calendar.tsx`）で表示する。候補日以外の日付は選択不可、スクロール中の現在アクティブな候補日はハイライトされ表示月も自動追従する。候補日をクリックすると該当セクションへ `scrollIntoView` する。

## 回答フロー（新規参加）

`components/responses/JoinButton.tsx` →「予定を回答する」→ `components/responses/ResponsesDialog.tsx`（ダイアログ）。

1. **参加者情報**（`components/form/UserInfoFields.tsx`）: 名前・コメント・パスワードを入力。
   - バリデーション（`schema.ts` の `userFormSchema`）: 名前 1〜10 文字 / コメント 40 文字以内 / パスワード 3〜12 文字。
2. **回答グリッド**（`components/form/ResponsesFields.tsx`）: ダイアログを開くと候補日ごとに `start_time`〜`end_time` を 30 分刻みで展開し、全スロットを `status: "ok"` で初期化する。下書きが残っている場合はそちらを復元する（下記）。
3. 送信: RPC `save_user_responses` でユーザーと回答をまとめて保存する（パスワードは平文で渡し、RPC 内でハッシュ化される）。

### 入力の保護（新規回答）

他の参加者の回答を見るために一度ダイアログを閉じても、入力をやり直さずに済むようにしている。

- 背景クリックでは閉じない（`disablePointerDismissal`）。
- × と Esc は確認なしで閉じる。入力は下書きとして残るため失われない。
- キャンセルボタンは破棄の意思表示として扱い、未保存の変更があれば `shared/UnsavedChangesDialog.tsx` で確認する（`hooks/useDirtyCloseGuard.ts`）。
- 下書きは `hooks/useResponseDraft.ts` が sessionStorage に保存する。入力が始まってから（`isDirty`）500ms のデバウンスで書き込み、閉じる直前に書き切る。
- 入力中はフッター上部に「入力内容は自動で保存されます」と表示する。閉じても消えないことを、閉じる前に伝えるため。
- 下書きが残っている状態で回答ダイアログを開こうとすると、`responses/ResponseDraftDialog.tsx` が先に出て、続きから入力するか最初から入力するかを選ばせる。黙って復元すると、書き直したい人が一度開いてから破棄する遠回りを強いられるため。
- 下書きは送信成功時と、「最初から入力する」「破棄して閉じる」を選んだときに削除する。
- パスワードは下書きに含めないため、復元後も入力し直す必要がある。
- 保存形式の検証は `lib/responseDraft.ts`。版数違い・壊れた JSON・現在の候補日に無い `candidate_id` を含むものは復元せず破棄する。

参加者の編集（`UserEditDialog`）はサーバーの現在値が正なので下書きの対象外。こちらは × と Esc でも破棄確認を挟む。

### 回答グリッドの操作（新規・編集で共用）

- 上部の `ToggleGroup` で塗るステータスを選択: `ok` = 参加（⚫︎ 青）/ `maybe` = 未定（▲ 黄）/ `ng` = 不参加（✖︎ 灰）。
- 候補日ごとのテーブルに `TIME_OPTIONS` の 30 分刻みで列が並び、候補の時間範囲外のセルは無効表示。
- PC はマウスドラッグ、スマホはタッチスワイプ（`elementFromPoint` + `data-index` でセル特定）で連続して塗れる。

## 参加者の編集・削除

編集フローは「事前検証 → 検証済み平文の引き回し → 更新 RPC で再検証」の 3 段階（パスワード照合は常にサーバー側）。

1. `UserEditPasswordDialog`: 本人パスワードを入力し、RPC `verify_user_password` で事前検証する（真偽値を返す read 用途）。
2. 検証 OK なら平文パスワードを親コンポーネントが保持し、`UserEditDialog` を開く。
3. 名前・コメント・回答を編集し、RPC `update_user_with_responses` で更新する（RPC 内で再照合。回答は全削除 → 洗い替え insert）。

削除は 2 経路あり、どちらも RPC `delete_user`（**本人パスワード or イベントパスワードのいずれか一致**で削除可）:

- 参加者行のゴミ箱ボタン → `UserDeleteDialog`（本人による削除を想定）
- 幹事メニュー → `UserDeletePickerDialog`（パスワード入力 + ラジオで対象参加者を選択）

## 幹事用メニュー（`components/event/MenuButton.tsx`）

ドロップダウンから以下を実行できる。パスワード付き操作の不一致エラーは `isPasswordError()`（SQLSTATE `PWD01` 判定）でフィールドエラーにマッピングする。

| 操作 | ダイアログ | RPC | 備考 |
|---|---|---|---|
| イベント編集 | `EventEditDialog` | `update_event` | タイトル・コメントを編集用パスワードで更新 |
| 共有 | `EventShareDialog` | — | 現在の URL を表示・クリップボードコピー |
| イベント削除 | `EventDeleteDialog` | `delete_event` | イベント一式を削除し、成功で `/` へ遷移 |
| 参加者削除 | `UserDeletePickerDialog` | `delete_user` | 上記参照 |

## データ更新パターン

mutation は `hooks/useEventMutations.ts` の hook（`useSaveResponses` / `useUpdateUser` / `useDeleteUser` / `useDeleteEvent`）を使う。成功時に hook 内で `eventKeys.detail(eventId)` を `invalidateQueries` するため、`onSuccess` / `refresh` の prop drilling は行わない。
