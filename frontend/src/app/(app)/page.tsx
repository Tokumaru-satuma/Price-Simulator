import { ThemeModeSelect } from "@/features/theme/theme-mode-select";

export default function HomePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-page text-text">
      <section className="w-full max-w-md rounded-dialog border border-border bg-surface p-stack-xl shadow-card">
        <p className="text-sm font-medium text-primary">アプリケーション</p>
        <h1 className="mt-stack-xs text-2xl font-semibold">準備中です</h1>
        <p className="mt-stack-sm text-sm leading-6 text-text-muted">
          プロジェクト固有の画面とナビゲーションを追加してください。テーマはここから確認できます。
        </p>

        <div className="mt-stack-xl">
          <label
            htmlFor="initial-theme-mode"
            className="mb-stack-xs block text-sm font-medium"
          >
            表示テーマ
          </label>
          <ThemeModeSelect id="initial-theme-mode" />
        </div>
      </section>
    </main>
  );
}
