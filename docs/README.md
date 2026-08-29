# Schedutch ドキュメント

Schedutch は、登録・ログイン不要で使える URL 共有型の日程調整サービス。イベントを作成して URL を共有し、参加者が 30 分単位で予定を回答する。書き込み操作はイベント・参加者ごとのパスワードで保護される。

## 目次

| ドキュメント | 内容 |
|---|---|
| [overview.md](overview.md) | アプリ概要・技術スタック・画面一覧 |
| [event-create.md](event-create.md) | イベント作成画面（`/new`）の仕様 |
| [event-detail.md](event-detail.md) | イベント閲覧・回答画面（`/event/[id]`）の仕様 |
| [extract.md](extract.md) | 予定抽出機能の仕様・アルゴリズム |
| [database.md](database.md) | データモデル・RPC・セキュリティ方針 |

開発規約（コーディング・Git・ディレクトリ構成の詳細）は [.claude/CLAUDE.md](../.claude/CLAUDE.md) を参照。
