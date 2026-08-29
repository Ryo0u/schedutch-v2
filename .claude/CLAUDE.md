# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**このファイルには規約（常に守るルール）だけを書く。** 仕様・アーキテクチャの説明は `docs/` に置き、ここからはリンクするだけにする。

## コマンド

```bash
npm run dev       # 開発サーバー起動 (localhost:3000)
npm run build     # プロダクションビルド
npm run lint      # ESLint（警告も許容しない）
npm run lint:fix  # ESLintの自動修正
npm run format       # Prettierによるフォーマット
npm run format:check # Prettierの差分チェック（CIと同じ）
npm run test      # Vitest（ユニットテスト）
npm run test:watch # Vitest watchモード
npm run db:start   # ローカルSupabaseスタック起動（Docker Desktopが必要）
npm run db:reset   # migrations全適用 + seed投入 + 型生成（gen:types込み）
npm run db:stop    # ローカルSupabaseスタック停止
npm run env:local  # .env.localをローカルSupabase向けに設定（既定）
npm run env:prod   # .env.localを本番Supabase向けに切り替え（稀なケースのみ）
```

DBスキーマ・RPC・RLSの変更検証はローカルSupabaseで行う（→ [docs/overview.md](../docs/overview.md#ローカルsupabase環境)）。本番反映は `main` への push で GitHub Actions が `supabase db push` を自動実行する。破壊的変更を含む場合はマージ前に `supabase db diff --linked` でdriftを確認する。

## テスト

Vitest によるユニットテストを導入済み。対象は純粋関数（`lib/` / `features/{feature}/lib/`）と zod スキーマ（`schema.ts`）。テストファイルは対象と同居させる（`xxx.ts` の隣に `xxx.test.ts`）。テストデータの時刻は UTC ISO 文字列で固定し、実行環境の TZ に依存させない。hooks・コンポーネントのテストは未導入（必要になったら jsdom / Testing Library を追加する）。CI（GitHub Actions）で PR 時に lint + test を実行する。

## ドキュメント

Schedutch は登録・ログイン不要の URL 共有型日程調整サービス。Next.js 16 App Router + React 19 + TypeScript、バックエンドは Supabase（DB と RPC のみ。認証機能は不使用）。

仕様は `docs/` に集約している。該当機能に触れる前に読むこと。

| ドキュメント | 内容 |
|---|---|
| [docs/overview.md](../docs/overview.md) | アプリ概要・技術スタック・画面一覧・UI/スタイリング・環境変数 |
| [docs/event-create.md](../docs/event-create.md) | イベント作成画面（`/new`）の仕様 |
| [docs/event-detail.md](../docs/event-detail.md) | イベント閲覧・回答画面（`/event/[id]`）の仕様・データ更新パターン |
| [docs/extract.md](../docs/extract.md) | 予定抽出機能の仕様・アルゴリズム |
| [docs/database.md](../docs/database.md) | データモデル・RPC・RLS/セキュリティ・パスワード・時刻の扱い |

## ディレクトリ構成

機能単位で凝集する `features/` 構成を採用している。

```
schedutch-v2/
├── app/                  # App Router。薄いServer Componentで各featureのContainerを描画するだけ
├── features/             # 機能単位で凝集。feature間の直接importは禁止
│   ├── home/             # トップページ（LP）。セクションごとにcomponents/配下を分割
│   ├── event-create/     # イベント作成（/new）
│   └── event-detail/     # イベント閲覧・回答（/event/[id]）
│       ├── components/   # UI。ドメイン単位でサブディレクトリに分割
│       ├── api/          # Supabaseへの実アクセス（select / rpc）
│       ├── hooks/        # TanStack Queryのquery/mutation hook、ダイアログ用hook
│       ├── lib/          # feature固有のpure関数
│       ├── schema.ts     # フォームの型・zodスキーマ
│       ├── types.ts      # feature固有の型
│       └── index.ts      # barrel（公開面。appからはここ経由でimport）
├── hooks/                # 複数featureで共有するhook専用
├── components/
│   ├── ui/               # shadcn/uiベースの汎用プリミティブ
│   ├── form/             # react-hook-form合成のフォーム部品（feature間共有）
│   ├── layout/           # 共通レイアウト
│   └── providers/        # アプリ全体のProvider
├── lib/                  # 全体共有のpure関数・定数・zodスキーマ
├── utils/supabase/       # Supabaseクライアント（シングルトン）
└── supabase/             # supabase CLI（config.toml / migrations）
```

`event-create` / `home` の内訳も `event-detail` と同じ規則に従う。

- feature 固有の Supabase アクセスは `features/{feature}/api/`、それを包む query/mutation hook は `features/{feature}/hooks/` に置く。
- トップの `hooks/` は複数 feature で共有する hook 専用。特定のコンポーネント群専用の hook は、その `components/` サブディレクトリ配下に `hooks/` を切って同居させてよい。
- feature 間の直接 import は禁止。共有したくなったものは `lib/` か `components/ui/` に昇格させる。

## 開発規約

### 状態管理の使い分け

状態は種類ごとに道具を固定し、混在させない。

- **サーバー状態**（Supabase のデータ）: TanStack Query で管理する。**サーバーデータを Zustand 等のクライアントストアに複製しない**。
- **クライアント UI 状態**: `useState` / Context。複数コンポーネントで共有する状態が増えたら Zustand を検討する（先回りで導入しない）。
- **フォーム状態**: `react-hook-form` + `zod` で統一。
- **未送信フォームの下書き**: 誤操作で失わせたくない入力だけ sessionStorage に退避する。共有端末に残さないため localStorage は使わない。パスワード等の秘密情報は下書きに含めない。読み書きは try/catch で囲み、ストレージが使えない環境でも入力を止めない。

### データアクセス

- Supabase への実アクセス（select / rpc / insert 等）は `features/{feature}/api/` の関数に集約し、コンポーネントから直接 `supabase` を呼ばない。api 関数は TanStack Query hook（`features/{feature}/hooks/`）から呼ぶ。
- **write（作成・更新・削除）は全て Supabase RPC 経由**。RLS で直叩き write を封鎖しているため、`supabase.from(...).update()/.delete()/.insert()` をコンポーネントや api から直接呼ばない。
- **パスワードのハッシュ化・照合はサーバー（RPC 内 `crypt()`）側で行う**。クライアントでハッシュ化・照合をしない。`password_digest` はクライアントに配信しない（型にも持たせない）。
- **`events` / `users` に列を追加するマイグレーションは、同じファイルに `grant select ("新列") on ... to anon, authenticated;` を書く**。この 2 テーブルは列単位 revoke 済みでテーブルレベル GRANT が効かず、足さないと新列を含む select が 401 になる（→ [docs/database.md](../docs/database.md#rls--権限)）。
- 取得データは `data` を prop で配布せず、各セクションが `eventId` を受けて自身で query hook を呼ぶ。mutation 成功時の再取得は hook 内の `invalidateQueries` で行い、`onSuccess` / `refresh` を prop drilling しない。
- 型の置き場: feature 固有なら `features/{feature}/types.ts`、複数 feature で共有するもののみ `lib/`。
- 時刻は UTC 保存・表示時に `lib/datetime.ts` の JST 変換関数で変換する。時刻選択肢は `lib/constants.ts` の `TIME_OPTIONS` を共通使用する。

詳細な仕組み（RLS・RPC 一覧・パスワードの取り扱い）は [docs/database.md](../docs/database.md) を参照。

### エラーハンドリング

mutation の catch 節では、ユーザー影響の有無で通知先を分ける。

- **ユーザー影響あり**（保存・削除など操作結果を伝える必要がある場合）: `sonner` の `toast.error(...)` でユーザーに通知する。`alert()` は使わない。
- **詳細情報**（デバッグ用のエラーオブジェクト等）: `console.error(...)` に出力する（`console.log` は使わない）。

### 命名・ファイル

- 変数・関数は camelCase、型・コンポーネントは PascalCase。
- コンポーネントファイルは PascalCase（例: `EventContainer.tsx`）。hook は `useXxx.ts`（camelCase）。
- **コンポーネントは名詞句**で `[ドメイン][操作/状態][UI種別]` の順に命名する（例: `EventEditDialog`, `UserDeletePickerDialog`）。動詞始まり（`InputXxx` / `CreateXxx` / `SelectXxx`）は使わない。
- UI種別サフィックスの語彙: `Container` / `Dialog` / `Form`（送信処理まで持つフォーム全体）/ `Fields`（フォームの入力フィールド群）/ `List` / `Section` / `Panel` / `Button` / `Actions`（ボタン群）/ `Skeleton` / `Info`（表示セクション）。
- 単複: 単一エンティティを扱うものは単数（`UserEditDialog`）、コレクション全体を表示するものは複数（`UsersInfo`, `ResponsesInfo`）。ただし `List` サフィックスはコレクションが自明なので単数 + List（`CandidateList`）。
- 関数は動詞始まり camelCase（api は CRUD 動詞: get/create/save/update/delete/verify、lib は to/format/build 等）。定数は UPPER_SNAKE、zod スキーマは `xxxSchema`。
- 新規ファイルにタイポ・表記ゆれを持ち込まない。

### ドキュメント更新

- **書き分け**: 規約（守るべきルール）は CLAUDE.md、仕様（現状の説明）は `docs/`。同じ内容を両方に書かない。
- ディレクトリ構成のツリーには**個別ファイル名を列挙せず、そのディレクトリの役割だけ**を書く。ファイルを追加・リネームしてもツリーは更新しない（配置ルール自体が変わったときだけ更新する）。
- 次を変更したら**同じ PR 内で** CLAUDE.md も更新する: 配置ルール、命名規則、状態管理／データアクセス方針、ライブラリの導入・変更。
- 画面仕様・DB スキーマ・RPC を変更したら**同じ PR 内で** 該当する `docs/` を更新する。
- README は指示があるときのみ変更する（勝手に生成・変更しない）。

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

### ブランチ

`<type>/<英語ケバブケース>` 形式。type はコミットと同じ語彙を使う。

- 例: `feature/tanstack-query`、`refactor/features-structure`、`fix/dialog-position`
- ベースは `develop`。作業ブランチは `develop` から切る。

### プルリクエスト

- 向き先は `develop`（`develop` → `main` は別途リリース時にまとめる）。
- タイトルはコミットと同じ Conventional Commits 形式。
- 本文に「概要 / 変更内容 / 検証（build・lint結果）」を日本語で記載する。
- マージ後は作業ブランチを削除する。
