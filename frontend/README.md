# Frontend Template

Django + DRF の Cookie JWT API と組み合わせる Next.js App Router の共通フロントエンド基盤。

## 起動

```powershell
cp .env.example .env.local
npm install
npm run dev
```

`BACKEND_ORIGIN` に Django の URL を指定する。ブラウザからは `/api/*` proxy 経由でアクセスする。

## 含まれる基盤

- Cookie JWT 認証、refresh と1回だけの再試行
- TanStack Query、認証ガード、統一 API エラー表示
- テーマトークン、light / dark / system
- 共通 UI、確認ダイアログ、開発用 `/ui-preview`
- 固定サイドバー・ヘッダー、モバイル Push メニュー、固定ボトムメニュー

## プロジェクト固有部分

`src/features/app/navigation.tsx` に画面遷移を定義する。設定・ログアウトは共通レイアウトが提供する。モバイルの固定ボトムメニューに表示するリンクだけ `showInMobileBottom: true` を指定する。

## 検証

```powershell
npm run lint
npm run build
```
