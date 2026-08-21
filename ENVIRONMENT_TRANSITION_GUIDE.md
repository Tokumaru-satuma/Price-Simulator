# 環境移行手順

## 1. 環境区分

テンプレートから作成したシステムを、ローカル開発、社内運用試験、本番運用へ安全に移行するための共通手順を定める。

| 環境 | `ENVIRONMENT` | `DEBUG` | HTTP | HTTPSセキュリティ |
|---|---|---:|---:|---:|
| ローカル開発 | `development` | `DEBUG`の指定に従う | 可 | 任意 |
| 社内運用試験 | `internal` | 常に`false` | 可 | 任意 |
| 本番運用 | `production` | 常に`false` | HTTPSへリダイレクト | 常に有効 |

`internal` と `production` では、`SECRET_KEY`、`ALLOWED_HOSTS`、`CORS_ALLOWED_ORIGINS`、`CSRF_TRUSTED_ORIGINS` が未設定の場合はバックエンドを起動しない。

## 2. 共通の事前準備

1. PostgreSQLのバックアップを取得する。
2. 配備対象のソースコードとマイグレーションの適用状況を確認する。
3. `.env.example` を基に、Git管理外の `backend/.env` を用意する。
4. `SECRET_KEY`、DBパスワードなどの秘密情報をリポジトリへ保存しない。
5. 運用試験と本番ではNext.jsを `npm ci`、`npm run build`、`npm run start` で起動し、`npm run dev` を使用しない。

## 3. development：ローカル開発

```dotenv
ENVIRONMENT=development
DEBUG=True
ENABLE_HTTPS_SECURITY=False
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000
```

```powershell
cd backend
.\venv\Scripts\python.exe manage.py check

cd ..\frontend
npx tsc --noEmit
npm run lint
```

## 4. internal：社内運用試験

`internal` は社内LANからのみ接続できるHTTP環境を想定し、インターネットへ公開しない。

```dotenv
ENVIRONMENT=internal
DEBUG=False
ENABLE_HTTPS_SECURITY=False
SECRET_KEY=環境固有の十分に長い秘密鍵
ALLOWED_HOSTS=app.internal,192.0.2.10
CORS_ALLOWED_ORIGINS=http://app.internal:3000
CSRF_TRUSTED_ORIGINS=http://app.internal:3000
```

`internal` では `DEBUG=True` が残っていても、アプリケーション側で `DEBUG=false` を強制する。

移行時は次を確認する。

1. 接続元を社内LANに制限する。
2. 環境固有の `backend/.env` を配置する。
3. DBバックアップ後に必要なマイグレーションを適用する。
4. Djangoを再起動し、`DEBUG=false` であることを確認する。
5. Next.jsを本番ビルドして起動する。
6. 認証、主要な登録・更新・参照操作、ログを確認する。
7. Djangoのポートを利用者端末へ直接公開せず、Next.jsまたはリバースプロキシからだけ接続可能にする。

HTTPSを先行検証するときは、`ENABLE_HTTPS_SECURITY=True` に変更し、CORSとCSRFのオリジンを `https://` へ変更する。

## 5. production：本番運用

本番はVPNなどで接続元を制限し、VPN内でもHTTPSを必須とする。

```dotenv
ENVIRONMENT=production
DEBUG=False
ENABLE_HTTPS_SECURITY=True
SECRET_KEY=本番専用の十分に長い秘密鍵
ALLOWED_HOSTS=app.example.jp
CORS_ALLOWED_ORIGINS=https://app.example.jp
CSRF_TRUSTED_ORIGINS=https://app.example.jp
```

`production` では `ENABLE_HTTPS_SECURITY=False` が残っていてもHTTPSセキュリティを強制する。TLSをリバースプロキシで終端し、Djangoへ `X-Forwarded-Proto: https` を渡す。

移行時は次を実施する。

1. VPN、DNS、TLS証明書、ファイアウォールを準備する。
2. PostgreSQLとDjangoのポートをインターネットへ直接公開しない。
3. 本番用 `backend/.env` を配置する。
4. DBバックアップ後に必要なマイグレーションを適用する。
5. 次の検証を実行してからアプリケーションを再起動する。

```powershell
cd backend
.\venv\Scripts\python.exe manage.py check
.\venv\Scripts\python.exe manage.py check --deploy

cd ..\frontend
npm ci
npm run build
npm run lint
```

本番公開前に次を確認する。

- HTTPアクセスがHTTPSへリダイレクトされる。
- JWT、セッション、CSRF Cookieに `Secure` が付いている。
- 認証Cookieに `HttpOnly` と適切な `SameSite` が付いている。
- HSTS、CSP、`X-Content-Type-Options`、`X-Frame-Options` が返る。
- 本番CSPの `script-src` に `unsafe-eval` が含まれない。
- ログイン、トークン更新、ログアウトが成功する。
- VPN未接続の端末から接続できない。

## 6. 切戻し

1. 障害発生時は新規アクセスを停止する。
2. アプリケーションを直前の検証済みバージョンへ戻す。
3. DB変更を伴う場合は、マイグレーションの可逆性を確認してから戻す。
4. 必要な場合は取得済みバックアップから復旧する。
5. 社内試験へ戻す場合は、環境を明示的に `internal` へ変更する。`production` のままHTTPS設定を解除しない。
6. 切戻し後に認証と主要画面を確認し、原因と対応内容を記録する。

## 7. 運用上の注意

- 固定IPだけを認証手段とせず、VPN、アプリ認証、HTTPSを併用する。
- `internal` をインターネットへ公開しない。
- `DEBUG=true` の環境を運用試験または本番に使用しない。
- 許可ホスト、CORS、CSRFへワイルドカードを指定しない。
- 証明書の有効期限、DBバックアップ、依存関係の脆弱性を定期的に確認する。
