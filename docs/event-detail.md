# イベント閲覧・回答（`/event/[id]`）

実装: `features/event-detail/`（コンテナ: `components/EventContainer.tsx`）

## ページ構成

`EventContainer` が `useEvent`（TanStack Query）でイベント一式（events + candidates + users + responses の結合クエリ）を取得する。ロード中は `EventSkeleton`、失敗時はエラーメッセージを表示する。

埋め込みリレーションの並び順はクエリ側で明示する。候補日は `start_time` 昇順、参加者は `created_at` 昇順。PostgREST は `order` 指定が無い場合の順序を保証しないため、これが無いと予定一覧・サイドナビカレンダー・回答グリッドの表示順が不定になる。候補日に `index_number`（追加順）を使わないのは、作成画面の候補日一覧が日付昇順で表示されており、詳細画面と並びがズレるため。

各セクションは `data` を prop で受け取らず、`eventId` を受けて自身で `useEvent` する（キャッシュ共有により再フェッチは起きない）。

| セクション | 実装 | 内容 |
|---|---|---|
| イベント情報 | `components/event/EventInfo.tsx` | タイトル・コメント・日付範囲・候補日件数・回答者数・自動削除予定日 |
| 参加者一覧 | `components/users/UsersInfo.tsx` | 回答者の一覧と編集・削除の入り口 |
| 予定一覧 | `components/responses/ResponsesInfo.tsx` | 全員の回答をグリッド表示。開催予定の時間帯も帯で示す |
| 予定抽出 | `components/extract/ExtractPanel.tsx` | 条件抽出（→ [extract.md](extract.md)） |
| 開催予定 | `components/plan/PlanSection.tsx` | 確定した日時・メンバー・メモの一覧（下記） |

予定一覧・予定抽出・開催予定は `ExtractSlotsProvider`（Context）で包まれ、抽出結果のハイライト状態を共有する。画面幅 lg 以上ではサイドナビ（`EventSideNav`）を表示する。本文と同じ `flex` コンテナ内で `sticky` 配置され、本文の左に並ぶ。

サイドナビの「予定一覧」アコーディオンを開くと、候補日一覧を `CandidateList.tsx` がカレンダー形式（`components/ui/calendar.tsx`）で表示する。候補日以外の日付は選択不可、スクロール中の現在アクティブな候補日はハイライトされ表示月も自動追従する。候補日をクリックすると該当セクションへ `scrollIntoView` する。

リンクカード（OGP）用に、`app/event/[id]/page.tsx` の `generateMetadata` がサーバー側で `getEventTitle` によりイベントのタイトルだけを取得し、`title`（`<イベント名> | schedutch`）と `openGraph` に流す。description は固定文で、コメント本文は URL 転送先で内容が見えないよう載せない。イベントが存在しない場合・取得に失敗した場合は `app/layout.tsx` の既定メタデータにフォールバックする。

`EventInfo` は自動削除予定日も表示する（`features/event-detail/lib/deletion.ts`）。削除ロジックは DB の `delete_expired_events` RPC と揃えており、残り3日以内・期限超過は日付を出さず「まもなく自動的に削除されます」と表示する。削除の仕組み自体は → [database.md](database.md#自動削除)。

## 回答フロー（新規参加）

`components/responses/JoinButton.tsx` →「予定を回答する」→ `components/responses/ResponsesDialog.tsx`（ダイアログ）。

1. **参加者情報**（`components/form/UserInfoFields.tsx`）: 名前・コメント・パスワードを入力。
   - バリデーション（`schema.ts` の `userFormSchema`）: 名前 1〜10 文字 / コメント 100 文字以内 / パスワード 3〜12 文字。
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

## 開催予定

抽出は候補を並べるところまでしかやらないため、「この日はこのメンバーで確定」という決定を残す場所として `PlanSection` がある。DB に保存するので、URL を開いた全員が同じ内容を見る。**パスワードは不要で、URL を知る人なら誰でも追加・削除できる**（RPC は → [database.md](database.md#rpc-関数)）。

追加の入口は 2 つ（予定抽出の「候補一覧」の `[+]` と、セクションヘッダの「+ 予定を追加」）。どちらから作っても回答の状態とずれないよう、入力段階で次の制約をかけている（同じ検証を `create_plan` でも行う → [database.md](database.md#rpc-関数)）。

- **日付**は候補日からしか選べず、**開始・終了の選択肢はその候補日の時間帯そのもの**から作る（`lib/plans.ts` の `listPlanTimeOptions`）。候補日の外は選択肢に出ないので範囲外の予定を作れない。
- **メンバーはその時間帯の全コマを `ok` / `maybe` で回答している人だけ**選べる（`findAvailableParticipantIds`）。それ以外は「この時間は参加不可」と出して無効化する。日時を変えて参加できなくなった人は選択から自動で外す。
- **既存の予定と時間帯が重なる場合は作成できない**（`hasOverlappingPlan`）。追加ダイアログには選んだ日に登録済みの予定を並べて表示し、その内側にあたる時刻は Select の選択肢ごと無効にする（`listPlansInCandidate` / `listPlanTimeOptions`）。候補一覧側でも、重なるブロックの `[+]` は「時間が重複」で無効化する。時刻が完全一致のものは従来どおり `[✓] 追加済み`。

日時とメンバーを後から変える手段は用意していない。変えたい場合は削除して作り直す。

- 一覧は `start_time`（同時刻なら `end_time`）昇順。sm 以上はテーブル、sm 未満は 1 件 = 1 ブロックの縦積みに切り替える（横スクロールにするとメモが読めなくなるため）。
- 決定した時間帯は予定一覧（`CandidateSection`）の候補日の範囲行に薄い斜線（`PLAN_STRIPE_CLASS`）で重ね、時間軸のどこが確定済みかを一目で分かるようにする（ホバーで時間帯を表示）。ベタ塗りだと回答の色より主張が強くなるため斜線にしている。凡例にも同じ見た目で「開催予定」を出す。抽出結果のハイライトとは別物で、抽出していないときも常に表示する。
- その予定の時間帯に ▲（未定）で回答しているメンバーは、名前の後ろに `(▲)` を付ける。予定側にフラグを持たず毎回 `responses` から判定する（`lib/plans.ts` の `findMaybeParticipantIds`）ため、回答が `ok` に変われば ▲ も自動で外れる。予定は複数コマにまたがるので、1 コマでも未定なら未定として扱う。
- 「まとめをコピー」は `lib/plans.ts` の `formatPlans` で日付ごとにまとめたテキストを生成する。抽出結果のテキスト（`formatExtractTimes`）と同じ体裁。
- 作成時にメモは入力しない。後から編集できるのはメモだけ。`PlanMemoForm` がメモ欄をその場で入力欄に変え、Enter か focus 外しで保存、Esc で編集前に戻す（`update_plan_memo`）。バリデーションは `schema.ts` の `planMemoFormSchema`（100 文字以内）。
- 手動追加は `PlanCreateDialog` +`PlanFields`（バリデーションは `schema.ts` の `planFormSchema`）、抽出からの追加は `components/extract/ExtractBlockList.tsx` の `[+]`（→ [extract.md](extract.md)）、削除は行の 🗑（`PlanDeleteDialog`）。

### 取得を `useEvent` と分けている理由

予定は `hooks/usePlans.ts` の独立した query で取る。`useEvent` の結合クエリに含めると、予定を 1 件保存するたびにイベント全体が再取得され、`useExtractSlots` の「データが変わったら抽出結果を破棄」が発火して、続けて別のブロックを追加できなくなるため。

## データ更新パターン

mutation は `hooks/useEventMutations.ts` の hook（`useSaveResponses` / `useUpdateUser` / `useDeleteUser` / `useDeleteEvent`）と `hooks/usePlanMutations.ts` の hook（`useCreatePlan` / `useUpdatePlanMemo` / `useDeletePlan`）を使う。成功時に hook 内で `eventKeys.detail(eventId)` / `planKeys.list(eventId)` を `invalidateQueries` するため、`onSuccess` / `refresh` の prop drilling は行わない。

`useDeleteUser` だけは両方を invalidate する。参加者を消すと `plan_participants` も CASCADE で消えるため、別 query の予定一覧を更新しないと消えたメンバーが残って見えるため。

失敗時の通知は `components/providers/QueryProvider.tsx` の `MutationCache.onError` に集約している。各 mutation hook は `meta.errorMessage` に操作名を含む文言（例: 「予定の追加に失敗しました」）を宣言するだけで、コンポーネントの catch はダイアログを閉じない等の後処理だけを持つ。通知内容は `lib/rpcErrors.ts` の分類で決まる。

| 分類 | 通知 |
|---|---|
| パスワード不一致（`PWD01`） | トーストは出さず、各フォームが入力欄のエラーとして表示する |
| 未存在（`NTF01`） | 「削除された可能性があります」のトーストを出し、全 query を再取得する。イベント自体が消えていれば not-found 画面に切り替わる |
| 競合（`CNF01`） | RPC のメッセージ（「既に登録されている予定と時間が重なっています」等）をトーストに出し、全 query を再取得する |
| 通信エラー | 「接続を確認して、もう一度お試しください」のトースト |
| 想定外 | `meta.errorMessage` のトースト |

mutation は自動で再試行しない（TanStack Query の既定のまま）。RPC は POST で、応答だけが失われた場合に再送すると回答や予定が二重に作成されるため。query は未存在（`PGRST116`）のときだけ再試行せず即座に失敗させ、not-found 画面を遅らせない。
