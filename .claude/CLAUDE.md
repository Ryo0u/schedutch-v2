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
| `/new` | イベント作成フォーム（Server Component。`CreateEventContainer` を描画） |
| `/event/[id]` | イベント閲覧・回答ページ |

`/new/page.tsx`・`/event/[id]/page.tsx` はいずれも薄い Server Component で、client 境界のオーケストレーションを担う `Container` コンポーネント（`CreateEventContainer` / `EventContainer`）を描画するだけ。`CreateEventContainer`（Client Component）は `useForm` + `formSchema` とフォーム全体のレイアウトを内包し、静的なヒーロー部分は presentational な `NewHero` に切り出している。`EventContainer`（Client Component）は `useEvent`（TanStack Query）で結合クエリを取得し、loading/エラーのガードと全体レイアウトのみを担う。各セクションコンポーネント（`EventInfo` / `MenuButton` / `JoinButton` / `UsersInfo` / `ResponsesInfo` / `ExtractResponses`）は `data` を prop で受け取らず、`eventId` を受けて自身で `useEvent` する（TanStack Query のキャッシュ共有により再フェッチは起きない）。Supabase への実アクセスは `features/event-detail/api/` に集約している。フォームの型・zod スキーマは各 feature 直下の `schema.ts`（`features/event-detail/schema.ts` / `features/event-create/schema.ts`）に集約する。

```ts
// features/event-detail/api/eventApi.ts の取得クエリ（1回のクエリで全データを取得）
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

TanStack Query で管理する。取得は `features/event-detail/hooks/useEvent.ts` の `useEvent`、更新は `features/event-detail/hooks/useEventMutations.ts` の各 mutation hook（`useSaveResponses` / `useUpdateUser` / `useDeleteUser` / `useDeleteEvent`）を使う。mutation 成功時に hook 内で `eventKeys.detail(eventId)` を `invalidateQueries` するため、コンポーネント間で `onSuccess`/`refresh` を prop drilling しない。同様に取得データも `data` を prop で配布せず、各セクションが `eventId` を受けて自身で `useEvent` する（取得・更新とも「使う場所が hook を直呼びする」形で対称）。QueryClient は `components/providers/QueryProvider.tsx` で提供する。

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
│   ├── page.tsx          # トップ（LP。home featureのセクションを描画）
│   ├── new/page.tsx      # イベント作成（CreateEventContainer を描画）
│   └── event/[id]/page.tsx  # イベント閲覧・回答（EventContainer を描画）
├── features/
│   ├── home/              # トップページ（LP）
│   │   ├── components/    # 直下: LpFooter / MobileCtaBar / ScrollReveal（複数セクション横断）
│   │   │   ├── hero/          # HeroSection, HeroGrid
│   │   │   ├── steps/         # StepsSection, StepCard, BrowserFrame
│   │   │   ├── comparison/    # ComparisonSection, LegacyToolCard, PreviewCard
│   │   │   ├── extract/       # ExtractSection
│   │   │   ├── features/      # FeaturesSection
│   │   │   └── cta/           # CtaSection
│   │   ├── constants.ts   # 各セクションの表示用データ（STEPS/FEATURES/CONDITIONS等）
│   │   ├── home.css       # LP専用スタイル（card-pop/marker/sticker等。app/page.tsxでimport）
│   │   └── index.ts       # barrel
│   ├── event-detail/     # 閲覧・回答機能（/event/[id]）
│   │   ├── components/   # 直下: EventContainer(親) / EventSkeleton
│   │   │   ├── event/        # EventInfo, MenuButton, Event{Edit,Delete,Share}Dialog
│   │   │   ├── users/        # UsersInfo, Users{Edit,Delete,Password}Dialog
│   │   │   ├── responses/    # ResponsesForm, ResponsesInfo, JoinButton
│   │   │   ├── extract/      # ExtractResponses
│   │   │   └── form/         # InputResponses, InputUserInfo（users/responses共有）
│   │   ├── api/          # Supabase アクセス（eventApi.ts）
│   │   ├── hooks/        # TanStack Query hook（useEvent / useEventMutations）
│   │   ├── schema.ts     # 回答フォームの型・zodスキーマ
│   │   ├── types.ts      # EventData など固有の型
│   │   └── index.ts      # barrel（公開面。app からはここ経由で import）
│   └── event-create/     # 作成機能（/new）
│       ├── components/   # 直下: CreateEventContainer(親) / NewHero / CreateEvent / InputEventInfo / CreatedDialog
│       │   └── candidates/   # InputEventCandidates, CandidatesList, EmptyList
│       ├── api/          # Supabase アクセス（eventApi.ts）
│       ├── schema.ts     # 作成フォームの型・zodスキーマ
│       ├── hooks/        # useCreateEvent
│       └── index.ts      # barrel
├── hooks/                # 複数featureで使う共通hook（UseDeviceType）
├── components/
│   ├── ui/               # shadcn/ui ベースの汎用プリミティブ
│   ├── layout/           # Header など共通レイアウト
│   └── providers/        # ThemeProvider / QueryProvider
├── lib/                  # constants(TIME_OPTIONS) / utils(toJST等)
└── utils/supabase/       # Supabase クライアント（シングルトン）
```

feature 固有の Supabase アクセスは `features/{feature}/api/`、それを包む query/mutation hook は `features/{feature}/hooks/` に置く。トップの `hooks/` は複数 feature で共有する hook 専用。

feature 間の直接 import は禁止。共有したくなったものは `lib/` か `components/ui/` に昇格させる。

### 今後の方針

Supabase アクセスの `features/{feature}/api/` 集約と TanStack Query 化は実装済み（[データ更新パターン](#データ更新パターン) 参照）。取得データの受け渡しは `EventContainer` 起点の `data` prop 配布をやめ、各セクションが `eventId` を受けて自身で `useEvent` する形に統一済み（`onSuccess`/`refresh` の prop drilling も廃止済み）。Supabase を BaaS として使う方針は維持（自前バックエンド・モノレポ化はしない）。

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

## 開発規約

### 状態管理の使い分け

状態は種類ごとに道具を固定し、混在させない。

- **サーバー状態**（Supabase のデータ）: TanStack Query で管理する（[データ更新パターン](#データ更新パターン) 参照）。**サーバーデータを Zustand 等のクライアントストアに複製しない**。
- **クライアント UI 状態**: `useState` / Context。複数コンポーネントで共有する状態が増えたら Zustand を検討する（先回りで導入しない）。
- **フォーム状態**: `react-hook-form` + `zod` で統一。

### データアクセス

- Supabase への実アクセス（select / rpc / insert 等）は `features/{feature}/api/` の関数に集約し、コンポーネントから直接 `supabase` を呼ばない。api 関数は TanStack Query hook（`features/{feature}/hooks/`）から呼ぶ。
- ミューテーションは Supabase RPC 経由（`create_event_with_candidates` / `save_user_responses`）。複数テーブルにまたがり整合性が必要な操作は RPC 化を優先する。
- パスワードは**クライアントで `bcryptjs` によりハッシュ化してから**保存する。生パスワードを Supabase に送らない（ハッシュ化はコンポーネント側で行い、api 関数にはダイジェストを渡す）。
- 型の置き場: feature 固有なら `features/{feature}/types.ts`、複数 feature で共有するもののみ `lib/`。
- 時刻は UTC 保存・表示時に `toJST()` で変換。時刻選択肢は `TIME_OPTIONS` を共通使用する。

### 命名・ファイル

- 変数・関数は camelCase、型・コンポーネントは PascalCase。
- コンポーネントファイルは PascalCase（例: `EventContainer.tsx`）。hook は `useXxx.ts`（camelCase）。
- 新規ファイルにタイポ・表記ゆれを持ち込まない（既存の `hooks/UseDeviceType.tsx` は表記ゆれ。当該ファイルを触る際に是正してよい）。

### ドキュメント更新

- 次を変更したら**同じ PR 内で** CLAUDE.md も更新する: ディレクトリ構成、命名規則、状態管理／データアクセス方針、ライブラリの導入・変更。
- README は指示があるときのみ変更する（勝手に生成・変更しない）。