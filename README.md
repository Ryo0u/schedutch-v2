# Schedutch v2

登録・ログイン不要で使える URL 共有型の日程調整サービス。イベントを作成して URL を共有し、参加者が 30 分単位で予定を回答する。書き込み操作はイベント・参加者ごとのパスワードで保護される。

詳しい仕様は [docs/](docs/README.md) を、開発規約（コーディング・Git・ディレクトリ構成）は [.claude/CLAUDE.md](.claude/CLAUDE.md) を参照。

## 技術スタック

- Next.js 16 (App Router) + React 19 + TypeScript
- Supabase（DB・RPC のみ。認証機能は未使用）
- TanStack Query / react-hook-form + zod / Tailwind CSS v4 + shadcn/ui

## セットアップ

```bash
npm install
```

`.env.local` に以下を設定する。

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

## コマンド

```bash
npm run dev       # 開発サーバー起動 (localhost:3000)
npm run build     # プロダクションビルド
npm run lint      # ESLint
npm run prettier  # Prettierによるフォーマット
npm run gen:types # Supabaseのローカルスキーマから型を生成
```

テストは未導入。

## ローカル Supabase（Docker）

このプロジェクトは Supabase CLI 経由でローカル DB を Docker コンテナ群として起動する（`supabase start` / `npx supabase start`）。Postgres・Studio・Auth・Realtime・Storage・Kong など 10 コンテナ以上が同時に立ち上がるため、**メモリを多く消費する**。

- 作業が終わったら **必ず `supabase stop` で停止する**。起動しっぱなしにすると、他の開発コンテナ（devcontainer など）がメモリ不足で起動できなくなることがある。
- 現在の起動状況は `docker ps` で確認できる。`supabase_*_schedutch-v2` という名前のコンテナが該当する。
- 型生成（`npm run gen:types`）はローカル DB が起動している必要がある。生成が終わったら速やかに停止してよい。
