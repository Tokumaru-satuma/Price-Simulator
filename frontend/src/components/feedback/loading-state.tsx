type LoadingStateProps = {
  message?: string;
};

/** 画面全体のデータ取得中に表示する共通ローディング状態。 */
export function LoadingState({
  message = "読み込んでいます...",
}: LoadingStateProps) {
  return (
    <div
      role="status"
      className="grid min-h-screen place-items-center bg-background p-page text-sm text-text-muted"
    >
      {message}
    </div>
  );
}
