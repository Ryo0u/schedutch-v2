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
