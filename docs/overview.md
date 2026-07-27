# アプリ概要

## コンセプト

- **登録・ログイン不要**: アカウントを作らず、イベント作成 → URL 共有 → 回答、の 3 ステップで日程調整が完結する。
- **30 分単位の回答**: 候補日ごとに 30 分刻みのタイムスロットへ「参加（ok）/ 未定（maybe）/ 不参加（ng）」を塗って回答する。
- **パスワード保護**: 認証の代わりに、イベント（幹事用）と参加者（本人用）それぞれにパスワードを設定し、編集・削除時に照合する。パスワードは digest のみ保存し、照合はサーバー（DB の RPC）側で行う。
- **抽出機能**: 「この人たち全員が空いている時間」「N 人以上集まる時間」を条件抽出し、コピペ可能なテキストとして出力できる。

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
| パスワードハッシュ | bcryptjs（クライアント側ハッシュ化） | 3.x |

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

`.env.local` に記載。Supabase クライアントは `utils/supabase/client.ts` でシングルトンとして export する。
