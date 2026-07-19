# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## コマンド

```bash
npm run dev       # 開発サーバー起動 (localhost:3000)
npm run build     # プロダクションビルド
npm run lint      # ESLint
npm run prettier  # Prettierによるフォーマット
npm run test      # Vitest（ユニットテスト）
npm run test:watch # Vitest watchモード
```

### テスト

Vitest によるユニットテストを導入済み。対象は純粋関数（`lib/` / `features/{feature}/lib/`）と zod スキーマ（`schema.ts`）。テストファイルは対象と同居させる（`xxx.ts` の隣に `xxx.test.ts`）。テストデータの時刻は UTC ISO 文字列で固定し、実行環境の TZ に依存させない。hooks・コンポーネントのテストは未導入（必要になったら jsdom / Testing Library を追加する）。CI（GitHub Actions）で PR 時に lint + test を実行する。

## アーキテクチャ概要

Next.js 16 App Router + React 19 + TypeScript。バックエンドは Supabase（DBと RPC のみ。認証なし）。

### ページ構成

| ルート | 役割 |
|---|---|
| `/new` | イベント作成フォーム（Server Component。`CreateEventContainer` を描画） |
| `/event/[id]` | イベント閲覧・回答ページ |

`/new/page.tsx`・`/event/[id]/page.tsx` はいずれも薄い Server Component で、client 境界のオーケストレーションを担う `Container` コンポーネント（`CreateEventContainer` / `EventContainer`）を描画するだけ。`CreateEventContainer`（Client Component）は `useForm` + `formSchema` とフォーム全体のレイアウトを内包し、静的なヒーロー部分は presentational な `NewHero` に切り出している。`EventContainer`（Client Component）は `useEvent`（TanStack Query）で結合クエリを取得し、loading/エラーのガードと全体レイアウトのみを担う。各セクションコンポーネント（`EventInfo` / `MenuButton` / `JoinButton` / `UsersInfo` / `ResponsesInfo` / `ExtractPanel`）は `data` を prop で受け取らず、`eventId` を受けて自身で `useEvent` する（TanStack Query のキャッシュ共有により再フェッチは起きない）。Supabase への実アクセスは `features/event-detail/api/` に集約している。フォームの型・zod スキーマは各 feature 直下の `schema.ts`（`features/event-detail/schema.ts` / `features/event-create/schema.ts`）に集約する。

```ts
// features/event-detail/api/eventApi.ts の取得クエリ（1回のクエリで全データを取得）
supabase.from('events').select(`*, candidates (*), users (*, responses (*))`)
```

### データモデル（Supabase）

- **events**: id, title, password_digest, comment
- **candidates**: id, event_id, start_time, end_time, index_number
- **users**: id, event_id, name, comment, password_digest
- **responses**: user_id, candidate_id, time, status（`"ok"` / `"maybe"` / `"ng"`）

パスワードは作成時にクライアント側で `bcryptjs` によりハッシュ化してから Supabase に保存する（digest 保存）。**検証（照合）は DB 側の RPC 内で `pgcrypto` の `crypt()` により行い、`password_digest` はクライアントに一切配信しない**（events/users の当該列は anon から SELECT 権限を剥奪）。

### RLS / セキュリティ方針

- events / candidates / users / responses は **RLS 有効**。anon には read のみ許可し、**INSERT/UPDATE/DELETE ポリシーは付与しない**（直叩き write を全面封鎖）。
- すべての write は **SECURITY DEFINER な RPC 経由**。パスワードが絡む操作は RPC 内で `crypt(平文, digest) = digest` により照合し、不一致なら例外を投げる。
- 既存 digest は bcryptjs 製（`$2a$`/`$2b$`）で、`crypt()` でそのまま検証できる。
- スキーマ・RLS・RPC は **supabase CLI のマイグレーション（`supabase/migrations/`）でバージョン管理**する。

### Supabase RPC 関数

ミューテーションは全て Supabase の RPC（ストアドプロシージャ）経由で行う。

- `create_event_with_candidates` — イベントと候補日をトランザクションで作成
- `save_user_responses` — ユーザーと回答をまとめて保存
- `update_event` — イベントのタイトル・コメントを更新（イベントパスワードで照合）
- `update_user_with_responses` — 参加者情報と回答を更新・洗い替え（本人パスワードで照合）
- `delete_event` — イベント一式を削除（イベントパスワードで照合）
- `delete_user` — 参加者を削除（本人 or イベントパスワードのどちらかで照合）
- `verify_user_password` — 編集ダイアログを開く前の事前検証（真偽を返す read 用途）

### 時刻の扱い

Supabase は UTC で保存する。表示時は `lib/datetime.ts` の `formatJSTTime()` / `formatJSTDate()` / `formatJSTCandidateDateLabel()`（候補日ラベル用の `formatJSTDate` ラッパー）/ `jstWallTimeToISO()` / `toJSTDateString()` で JST に変換する。時刻選択肢は `lib/constants.ts` の `TIME_OPTIONS`（00:00〜23:30、30分刻み）を共通で使用する。

### データ更新パターン

TanStack Query で管理する。取得は `features/event-detail/hooks/useEvent.ts` の `useEvent`、更新は `features/event-detail/hooks/useEventMutations.ts` の各 mutation hook（`useSaveResponses` / `useUpdateUser` / `useDeleteUser` / `useDeleteEvent`）を使う。mutation 成功時に hook 内で `eventKeys.detail(eventId)` を `invalidateQueries` するため、コンポーネント間で `onSuccess`/`refresh` を prop drilling しない。同様に取得データも `data` を prop で配布せず、各セクションが `eventId` を受けて自身で `useEvent` する（取得・更新とも「使う場所が hook を直呼びする」形で対称）。QueryClient は `components/providers/QueryProvider.tsx` で提供する。

### UIコンポーネント

`components/ui/` は shadcn/ui ベースのプリミティブ。一部 `@base-ui/react` を使用（`Dialog`、`DialogClose` など）。フォームは `react-hook-form` + `zod` で統一し、`Controller` を合成した `TextField` / `TextareaCounterField`（`components/form/`）をfeature間で共有する。スタイリングは Tailwind CSS v4 + `clsx`/`tailwind-merge`（`cn()` ユーティリティ）。

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
│   │   ├── hooks/         # usePrefersReducedMotion（LPアニメーションのreduced-motion購読）
│   │   ├── constants.ts   # 各セクションの表示用データ（STEPS/FEATURES/CONDITIONS等）
│   │   ├── home.css       # LP専用スタイル（card-pop/marker/sticker等。app/page.tsxでimport）
│   │   └── index.ts       # barrel
│   ├── event-detail/     # 閲覧・回答機能（/event/[id]）
│   │   ├── components/   # 直下: EventContainer(親) / EventSkeleton
│   │   │   ├── event/        # EventInfo, MenuButton, EventEditDialog, EventDeleteDialog, EventShareDialog
│   │   │   ├── users/        # UsersInfo, UserEditDialog, UserEditPasswordDialog, UserDeletePickerDialog（一覧から選んで削除）, UserDeleteDialog（対象確定済みの削除）
│   │   │   ├── responses/    # ResponsesDialog, ResponsesInfo, JoinButton
│   │   │   ├── extract/      # ExtractPanel
│   │   │   ├── form/         # ResponsesFields, UserInfoFields（users/responses共有）
│   │   │   └── shared/       # DeleteDialogShell（削除ダイアログ共通骨格。presentational）
│   │   ├── api/          # Supabase アクセス（eventApi.ts / errors.ts）
│   │   ├── hooks/        # TanStack Query hook（useEvent / useEventMutations）＋ usePasswordConfirm / useResetOnOpen（ダイアログopen時のreset定型）
│   │   ├── lib/          # pure関数（status.ts: 回答ステータス表示定義 / responses.ts: 回答データ整形 / validation.ts: feature固有バリデーション（nameSchema） / extractSlots.ts: 予定抽出アルゴリズム）
│   │   ├── schema.ts     # 回答フォームの型・zodスキーマ
│   │   ├── types.ts      # EventData など固有の型
│   │   └── index.ts      # barrel（公開面。app からはここ経由で import）
│   └── event-create/     # 作成機能（/new）
│       ├── components/   # 直下: CreateEventContainer(親) / NewHero / EventCreateActions / EventInfoFields / EventCreatedDialog
│       │   └── candidates/   # CandidatesFields, CandidateList, EmptyList
│       ├── api/          # Supabase アクセス（eventApi.ts）
│       ├── schema.ts     # 作成フォームの型・zodスキーマ
│       ├── hooks/        # useCreateEvent
│       └── index.ts      # barrel
├── hooks/                # 複数featureで使う共通hook（useDeviceType）
├── components/
│   ├── ui/               # shadcn/ui ベースの汎用プリミティブ
│   ├── form/             # react-hook-form合成のフォーム部品（TextField / TextareaCounterField）。feature間共有
│   ├── layout/           # Header など共通レイアウト
│   └── providers/        # ThemeProvider / QueryProvider
├── lib/                  # constants(TIME_OPTIONS) / datetime(JST変換) / validation(共通zodスキーマ・文字数上限定数) / utils(cn等)
├── utils/supabase/       # Supabase クライアント（シングルトン）
└── supabase/             # supabase CLI（config.toml / migrations: スキーマ・RLS・RPC）
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
- **write（作成・更新・削除）は全て Supabase RPC 経由**。RLS で直叩き write を封鎖しているため、`supabase.from(...).update()/.delete()/.insert()` をコンポーネントや api から直接呼ばない。
- **パスワード検証はサーバー（RPC 内 `crypt()`）側で行う**。クライアントで `bcrypt.compare` しない。編集フローは、事前検証（`verify_user_password`）→ 検証済み平文を編集ダイアログへ引き回し → 更新 RPC が再検証、という流れ。RPC がパスワード不一致で投げた例外は `isPasswordError()`（`features/event-detail/api/eventApi.ts`）で判定してエラー表示にマッピングする。
- パスワードは作成時に**クライアントで `bcryptjs` によりハッシュ化してから**保存する（生パスワードを保存しない）。照合は上記の通り DB 側。`password_digest` はクライアントに配信しない（型にも持たせない）。
- 型の置き場: feature 固有なら `features/{feature}/types.ts`、複数 feature で共有するもののみ `lib/`。
- 時刻は UTC 保存・表示時に `lib/datetime.ts` の JST 変換関数で変換。時刻選択肢は `TIME_OPTIONS` を共通使用する。

### エラーハンドリング

mutation の catch 節では、ユーザー影響の有無で通知先を分ける。

- **ユーザー影響あり**（保存・削除など操作結果を伝える必要がある場合）: `sonner` の `toast.error(...)` でユーザーに通知する。`alert()` は使わない。
- **詳細情報**（デバッグ用のエラーオブジェクト等）: `console.error(...)` に出力する（`console.log` は使わない）。

### 命名・ファイル

- 変数・関数は camelCase、型・コンポーネントは PascalCase。
- コンポーネントファイルは PascalCase（例: `EventContainer.tsx`）。hook は `useXxx.ts`（camelCase）。
- **コンポーネントは名詞句**で `[ドメイン][操作/状態][UI種別]` の順に命名する（例: `EventEditDialog`, `UserDeletePickerDialog`）。動詞始まり（`InputXxx` / `CreateXxx` / `SelectXxx`）は使わない。
- UI種別サフィックスの語彙: `Container` / `Dialog` / `Fields`（フォームの入力フィールド群）/ `List` / `Section` / `Panel` / `Button` / `Actions`（ボタン群）/ `Skeleton` / `Info`（表示セクション）。
- 単複: 単一エンティティを扱うものは単数（`UserEditDialog`）、コレクション全体を表示するものは複数（`UsersInfo`, `ResponsesInfo`）。ただし `List` サフィックスはコレクションが自明なので単数 + List（`CandidateList`）。
- 関数は動詞始まり camelCase（api は CRUD 動詞: get/create/save/update/delete/verify、lib は to/format/build 等）。定数は UPPER_SNAKE、zod スキーマは `xxxSchema`。
- 新規ファイルにタイポ・表記ゆれを持ち込まない。

### ドキュメント更新

- 次を変更したら**同じ PR 内で** CLAUDE.md も更新する: ディレクトリ構成、命名規則、状態管理／データアクセス方針、ライブラリの導入・変更。
- README は指示があるときのみ変更する（勝手に生成・変更しない）。