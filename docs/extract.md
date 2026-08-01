# 予定抽出機能

実装: `features/event-detail/`（UI: `components/extract/ExtractPanel.tsx`、ロジック hook: `components/extract/hooks/useExtractSlots.ts`、アルゴリズム: `lib/extractSlots.ts`）

回答結果から「条件を満たす時間帯」を抽出し、コピペ可能なテキストとして出力する機能。状態は `ExtractSlotsContext` で予定一覧（`ResponsesInfo`）と共有し、抽出結果をグリッドにハイライト表示できる。

## 抽出条件

### 対象の指定（`ParticipantSelector.tsx`、いずれか必須）

タブで切り替える。未選択のあいだ「抽出する」ボタンは無効。

- **参加者を選択**（`PARTICIPANTS` 条件): チェックした参加者**全員**が空いている時間帯を抽出する。
- **人数を選択**（`HEADCOUNTS` 条件): 指定人数以上が空いている時間帯を抽出する（1 人〜参加者数）。

### 絞り込みオプション（`ExtractFilters.tsx`、Collapsible 内）

| 条件 | 内容 |
|---|---|
| ▲（未定）も予定に含める | `includeMaybe`。ON にすると `maybe` の回答も「空いている」扱いにする |
| 時間を指定（`DURATION`） | 連続時間の最小値: 制限なし / 1 時間以上 / 2 時間以上 / 3 時間以上 |
| 日付範囲を指定（`DATERANGE`） | 候補日から開始日・終了日を選択。逆転入力は自動補正 |

「条件をリセット」で全条件を初期化できる。

## アルゴリズム（`lib/extractSlots.ts`）

30 分（`SLOT_INTERVAL`）のコマを単位として処理する。

1. **空き判定**: あるコマについて、参加者の response の `status` が `ok`（`includeMaybe` 時は `maybe` も）なら「空いている」とみなす（`isUserAvailable`）。
2. **コマ単位の絞り込み**: 全回答のコマを収集し、コマ単位条件（PARTICIPANTS / HEADCOUNTS / DATERANGE）を満たすコマだけ残す。
3. **連続コマの結合**（`createMergedBlocks`): 時間が連続し、かつ空いている参加者の顔ぶれが同じコマを 1 つの塊（ブロック）にまとめる。
4. **塊単位の絞り込み**: 塊の長さが DURATION 条件を満たすものだけ残す。

## 出力（`ExtractResultPanel.tsx`）

- 整形テキスト（`formatExtractTimes`）を読み取り専用のテキストエリアに表示する。日付ごとに以下の形式:

  ```
  15:30 - 20:00 : 田中, 佐藤(▲), 鈴木
  ```

  `maybe` で参加可とみなした人には `(▲)` を付ける。
- クリップボードコピーが可能。
- 「抽出結果を予定一覧にハイライト表示する」チェックを ON にすると、抽出された塊（`extractedBlocks`）が予定一覧のグリッド上で囲い表示される。
