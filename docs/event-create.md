# イベント作成（`/new`）

実装: `features/event-create/`（コンテナ: `components/CreateEventContainer.tsx`）

## フォーム項目とバリデーション

スキーマ: `features/event-create/schema.ts`（zod）

| 項目 | フィールド | 必須 | ルール |
|---|---|---|---|
| イベント名 | `title` | ○ | 1〜10 文字 |
| 編集用パスワード | `password` | ○ | 3〜12 文字。イベントの編集・削除時に必要 |
| コメント | `comment` | — | 200 文字以内（文字数カウンタ表示） |
| 候補日 | `candidates` | ○ | 1 件以上。各候補は開始時刻 < 終了時刻（`superRefine` で検証） |

フォームは `react-hook-form` + `zodResolver`。送信中は `<fieldset disabled>` でフォーム全体を無効化する。

## 候補日の入力（`components/candidates/CandidatesFields.tsx`）

1. `react-day-picker` の**範囲選択カレンダー**で日付範囲を選ぶ（デフォルト: 今日〜今日 + 5 日。デスクトップは 2 ヶ月表示、ロケール `ja`）。
2. 開始 / 終了時刻を `Select` で選ぶ（選択肢は `TIME_OPTIONS` = 30 分刻み。初期値 06:00〜21:00）。
3. 「追加」ボタンで、範囲内の各日を 1 日 1 候補として `useFieldArray` に展開する。
   - すでに追加済みの日付は `toDateString` 比較で重複除外され、カレンダー上でも `disabled` になる。
4. 追加済み候補は `CandidateList` に一覧表示される（0 件時は `EmptyList`）。

## 送信フロー（`components/CreateEventContainer.tsx`）

1. 各候補の日付 + 時刻を `jstWallTimeToISO`（`lib/datetime.ts`）で JST 壁時計 → UTC の ISO 文字列に変換し、配列 index を `index_number` として付与する。
2. `useCreateEvent` hook 経由（パスワードは平文で渡し、RPC 内でハッシュ化される）で RPC `create_event_with_candidates` を呼ぶ（イベントと候補日をトランザクションで作成）。
3. 成功: `EventCreatedDialog` を表示。失敗: sonner トースト（通知の仕組みは → [event-detail.md](event-detail.md#データ更新パターン)。想定外の失敗では「イベントの作成に失敗しました」）。

「リセット」ボタンで `form.reset()` により全項目を初期化できる。

## 作成完了ダイアログ（`components/EventCreatedDialog.tsx`）

- 共有 URL `${origin}/event/${eventId}` を表示する。
- クリップボードコピー（コピー後 1 秒間チェックマーク表示）。
- 「ページへ進む」で `/event/${eventId}` に遷移する。
