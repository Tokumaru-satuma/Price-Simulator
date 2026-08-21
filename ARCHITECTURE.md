# アーキテクチャ概要

この文書は、テンプレート全体の技術構成と各詳細設計書の役割をまとめる。

## 技術構成

| 領域 | 採用技術 | 役割 |
|---|---|---|
| Frontend | Next.js / React / TypeScript | 画面、認証状態、API通信、レスポンシブUI |
| Backend | Django / Django REST Framework | 業務API、認可、バリデーション、監査ログ |
| Database | PostgreSQL | 業務データの正本 |
| API Schema | drf-spectacular / OpenAPI | API仕様の機械可読な正本 |

## 依存関係の方針

- Backendの依存関係は `backend/requirements.txt` で管理する。
- Frontendのパッケージマネージャーはnpmとし、`frontend/package-lock.json` を正とする。
- Frontendの依存関係を復旧する場合は、`frontend` ディレクトリで `npm ci` を実行する。
- 業務データはPostgreSQLを正本とし、Excelは帳票・移行元以外には使用しない。

## 詳細設計書

- [BACKEND_ARCHITECTURE.md](BACKEND_ARCHITECTURE.md)
  - Django／DRFの共通モデル、ViewSet、Serializer、Permission、監査、OpenAPI、例外処理を定義する。
- [FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md)
  - Next.jsのディレクトリ責務、共通レイアウト、ナビゲーション、UI、状態管理、認証、レスポンシブ方針を定義する。
- `docs/project/`
  - 各業務アプリ固有のモデル、API、画面、運用方針を管理する。

## 設計上の原則

- フロントエンドは操作性・表示制御を担い、最終的な認可・バリデーションはバックエンドで行う。
- APIは統一レスポンス形式とOpenAPI Schemaを使用する。
- ユーザー管理は共通基盤として提供し、初期管理者作成後の登録・権限・利用状態・論理削除・復元を管理画面から行う。
- 管理者不在を防ぐ制御と、ユーザー権限とDjango管理権限の整合はバックエンドで保証する。
- 共通基盤の変更は、プロジェクトで検証後にテンプレートリポジトリへ同期する。
