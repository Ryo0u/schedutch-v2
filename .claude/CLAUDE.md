# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## コマンド

```bash
npm run dev       # 開発サーバー起動 (localhost:3000)
npm run build     # プロダクションビルド
npm run lint      # ESLint
npm run prettier  # Prettierによるフォーマット
```

テストは未導入。

## アーキテクチャ概要

Next.js 16 App Router + React 19 + TypeScript。バックエンドは Supabase（DBと RPC のみ。認証なし）。

### ページ構成

| ルート | 役割 |
|---|---|
| `/new` | イベント作成フォーム（Client Component） |
| `/event/[id]` | イベント閲覧・回答ページ |

`/event/[id]/page.tsx` は Server Component だが、データ取得は全て `EventClient.tsx`（Client Component）が担う。`EventClient` が Supabase から結合クエリでデータを一括取得し、`data` オブジェクトを子コンポーネントに渡す。

```ts
// EventClient の取得クエリ（1回のクエリで全データを取得）
supabase.from('events').select(`*, candidates (*), users (*, responses (*))`)
```

### データモデル（Supabase）

- **events**: id, title, password_digest, comment
- **candidates**: id, event_id, start_time, end_time, index_number
- **users**: id, event_id, name, comment, password_digest
- **responses**: user_id, candidate_id, time, status（`"ok"` / `"maybe"` / `"ng"`）

パスワードはクライアント側で `bcryptjs` によりハッシュ化してから Supabase に保存する。

### Supabase RPC 関数

ミューテーションは全て Supabase の RPC（ストアドプロシージャ）経由で行う。

- `create_event_with_candidates` — イベントと候補日をトランザクションで作成
- `save_user_responses` — ユーザーと回答をまとめて保存

### 時刻の扱い

Supabase は UTC で保存する。表示時は `lib/utils.ts` の `toJST()` で JST に変換する。時刻選択肢は `lib/constants.ts` の `TIME_OPTIONS`（00:00〜23:30、30分刻み）を共通で使用する。

### データ更新パターン

`EventClient` が `refresh` コールバックを定義し、子コンポーネントに `onSuccess` として渡す。ミューテーション成功後に子が `onSuccess()` を呼ぶことでデータを再取得する。

### UIコンポーネント

`components/ui/` は shadcn/ui ベースのプリミティブ。一部 `@base-ui/react` を使用（`Dialog`、`DialogClose` など）。フォームは `react-hook-form` + `zod` で統一。スタイリングは Tailwind CSS v4 + `clsx`/`tailwind-merge`（`cn()` ユーティリティ）。

### 環境変数

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

`.env.local` に記載。Supabase クライアントは `utils/supabase/client.ts` でシングルトンとして export している。

### ディレクトリ構成

機能単位で凝集する `features/` 構成を採用している。

```
schedutch-v2/
├── app/                  # App Router（ルーティング）
│   ├── new/page.tsx      # イベント作成
│   └── event/[id]/page.tsx  # イベント閲覧・回答（EventClient を描画）
├── features/
│   ├── event/            # 閲覧・回答機能
│   │   ├── components/   # EventClient ほか機能コンポーネント
│   │   ├── types.ts      # EventData など event固有の型
│   │   └── index.ts      # barrel（公開面。app からはここ経由で import）
│   └── new/              # 作成機能
│       ├── components/   # CreateEvent ほか
│       └── index.ts      # barrel
├── hooks/                # 複数featureで使う共通hook（UseDeviceType）
├── components/
│   ├── ui/               # shadcn/ui ベースの汎用プリミティブ
│   ├── layout/           # Header など共通レイアウト
│   └── providers/        # ThemeProvider
├── lib/                  # constants(TIME_OPTIONS) / utils(toJST等)
└── utils/supabase/       # Supabase クライアント（シングルトン）
```

feature 間の直接 import は禁止。共有したくなったものは `lib/` か `components/ui/` に昇格させる。

### 今後の方針（未実装）

Supabase アクセスを `features/{feature}/api/` に集約し、`hooks/` で TanStack Query 化する。`data`/`onSuccess` の prop drilling を解消する狙い。Supabase を BaaS として使う方針は維持（自前バックエンド・モノレポ化はしない）。

## Git規約

### コミット

Conventional Commits に従う。プレフィックスは英語、本文（説明）は日本語。

```
<type>: <日本語の要約>
```

| type | 用途 |
|---|---|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `refactor` | 挙動を変えないコード改善 |
| `style` | 表示・スタイルのみの変更（ロジック非変更） |
| `docs` | ドキュメント |
| `chore` | 設定・依存・雑務 |
| `test` | テスト |

- 例: `feat: ユーザー編集ダイアログを追加` / `fix: 削除ボタンのPC上での位置を修正`
- 1コミット1目的。無関係な変更を混ぜない。
- 確認なしに自動コミット・自動pushしない。
- テストコードやドキュメントを確認なしに削除・生成しない。

### ブランチ

`<type>/<英語ケバブケース>` 形式。type はコミットと同じ語彙を使う。

- 例: `feature/tanstack-query`、`refactor/features-structure`、`fix/dialog-position`
- ベースは `develop`。作業ブランチは `develop` から切る。

### プルリクエスト

- 向き先は `develop`（`develop` → `main` は別途リリース時にまとめる）。
- タイトルはコミットと同じ Conventional Commits 形式。
- 本文に「概要 / 変更内容 / 検証（build・lint結果）」を日本語で記載する。
- マージ後は作業ブランチを削除する。