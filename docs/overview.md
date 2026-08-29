# アプリ概要

## コンセプト

- **登録・ログイン不要**: アカウントを作らず、イベント作成 → URL 共有 → 回答、の 3 ステップで日程調整が完結する。
- **30 分単位の回答**: 候補日ごとに 30 分刻みのタイムスロットへ「参加（ok）/ 未定（maybe）/ 不参加（ng）」を塗って回答する。
- **パスワード保護**: 認証の代わりに、イベント（幹事用）と参加者（本人用）それぞれにパスワードを設定し、編集・削除時に照合する。パスワードは平文を RPC に渡し、ハッシュ化・照合ともサーバー（DB の RPC）側で行う。保存されるのは digest のみ。
- **抽出機能**: 「この人たち全員が空いている時間」「N 人以上集まる時間」を条件抽出し、その場で「開催予定」に登録できる。
- **開催予定**: 「確定した日時 + メンバー」を DB に蓄積し、URL を開いた全員が同じ内容を見られる（パスワード不要）。候補日の範囲外・既存の予定と重なる時間・その時間に参加できないメンバーは登録できず、後から変えられるのはメモだけ。

## 技術スタック

| 分類 | 技術 | バージョン |
|---|---|---|
| フレームワーク | Next.js（App Router） | 16.2 |
| UI ライブラリ | React | 19.2 |
| 言語 | TypeScript | 5.x |
| バックエンド | Supabase（DB + RPC のみ。認証機能は不使用） | supabase-js 2.x |
| サーバー状態管理 | TanStack Query | v5 |
| フォーム | react-hook-form + zod | v7 / v4 |
| スタイリング | Tailwind CSS + shadcn/ui + @base-ui/react | v4 |

## 画面一覧

| ルート | 実装 | 役割 |
|---|---|---|
| `/` | `app/page.tsx` + `features/home/` | LP（静的な紹介ページ。Hero / Steps / 比較 / 抽出紹介 / 特長 / CTA の各セクション） |
| `/new` | `app/new/page.tsx` → `CreateEventContainer` | イベント作成フォーム（→ [event-create.md](event-create.md)） |
| `/event/[id]` | `app/event/[id]/page.tsx` → `EventContainer` | イベント閲覧・回答・編集・抽出（→ [event-detail.md](event-detail.md)） |

`page.tsx` はいずれも薄い Server Component で、client 境界の `Container` コンポーネントを描画するだけの構成。

## アーキテクチャの要点

- 機能単位で凝集する `features/` 構成（`home` / `event-create` / `event-detail`）。feature 間の直接 import は禁止。
- Supabase への実アクセスは `features/{feature}/api/` に集約し、TanStack Query の hook（`features/{feature}/hooks/`）経由で使う。
- write（作成・更新・削除）は全て SECURITY DEFINER な RPC 経由。RLS で直叩き write は封鎖している（→ [database.md](database.md)）。
- 時刻は UTC で保存し、表示時に JST へ変換する（`lib/datetime.ts` の `formatJSTTime` / `formatJSTDate` / `formatJSTCandidateDateLabel` / `toJSTDateString` / `jstWallTimeToISO`）。時刻選択肢は `lib/constants.ts` の `TIME_OPTIONS`（00:00〜23:30、30 分刻み 48 件）を全画面で共通使用する。

ディレクトリ構成・開発規約の詳細は [.claude/CLAUDE.md](../.claude/CLAUDE.md) を参照。

## UI・スタイリング

- `components/ui/` は shadcn/ui ベースの汎用プリミティブ。一部は `@base-ui/react` を使用する（`Dialog` / `DialogClose` など）。
- フォームは `react-hook-form` + `zod` で統一し、`Controller` を合成した `TextField` / `TextareaCounterField`（`components/form/`）を feature 間で共有する。
- スタイリングは Tailwind CSS v4 + `clsx` / `tailwind-merge`（`lib/utils.ts` の `cn()` ユーティリティ）。
- サーバー状態は TanStack Query で管理し、`QueryClient` は `components/providers/QueryProvider.tsx` で提供する。

## 環境変数

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

`.env.local` に記載（gitignore 対象、既定値はローカル Supabase）。Supabase クライアントは `utils/supabase/client.ts` でシングルトンとして export する。

## ローカル Supabase 環境

DB スキーマ・RPC・RLS の変更検証は、本番プロジェクトに直接行わずローカルスタックで行う（Docker Desktop が必要）。`.env.local` は既定でローカル Supabase を指すため、`npm run dev` は追加設定なしでローカルに繋がる。

```bash
npm run db:start   # ローカルスタック起動（初回はイメージDLで数分かかる）
npm run db:reset   # migrationsを1本目から全適用 + seed.sql投入 + 型生成
npm run db:stop    # ローカルスタック停止
```

- `supabase/seed.sql` に、複数候補日 × 複数参加者 × ok/maybe/ng が混在するサンプルデータが定義されている（パスワードは全員 `test1234`）。
- 本番へマイグレーションを反映する前に `supabase db diff --linked` で drift（本番とマイグレーション履歴のズレ）がないか確認する。反映自体は従来通り `supabase db push`。

### 本番 Supabase への一時切り替え

本番固有のバグ再現など、稀に本番へ接続して確認したい場合のみ使う。

```bash
npm run env:prod    # .env.local.production の値を .env.local にコピー
npm run env:local    # .env.local.example の値に戻す（ローカルへ復帰）
```

- `.env.local.production` は各自の手元にのみ置く個人ファイル（gitignore 対象、リポジトリには含めない）。本番の URL / anon key を記載する。
- 本番へ接続した状態で `npm run dev` すると、`utils/supabase/client.ts` がターミナルに警告を出す（戻し忘れの事故防止）。
