type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

/** 画面全体の再試行可能なエラーを表示する共通コンポーネント。 */
export function ErrorState({
  title = "読み込みに失敗しました",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="grid min-h-screen place-items-center bg-background p-page">
      <section className="w-full max-w-md rounded-dialog border border-border bg-surface p-stack-xl text-center shadow-card">
        <h1 className="text-lg font-semibold text-text">{title}</h1>
        <p className="mt-stack-sm text-sm text-text-muted">{message}</p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-stack-lg rounded-control bg-primary px-control-x py-control-y text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
          >
            再試行
          </button>
        )}
      </section>
    </div>
  );
}
