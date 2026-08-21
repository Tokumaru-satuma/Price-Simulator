import { Button } from "./button";

type LoadMoreButtonProps = {
  loadedCount: number;
  totalCount: number;
  hasNextPage: boolean;
  isLoading: boolean;
  isError?: boolean;
  onLoadMore: () => void;
};

/** ページング一覧で共通利用する「さらに表示」UI。 */
export function LoadMoreButton({
  loadedCount,
  totalCount,
  hasNextPage,
  isLoading,
  isError = false,
  onLoadMore,
}: LoadMoreButtonProps) {
  if (loadedCount === 0) return null;

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <p className="text-xs text-text-muted" aria-live="polite">
        {loadedCount.toLocaleString("ja-JP")} / {totalCount.toLocaleString("ja-JP")}件を表示
      </p>
      {isError && (
        <p role="alert" className="text-sm text-danger">
          続きを取得できませんでした。再試行してください。
        </p>
      )}
      {hasNextPage && (
        <Button
          className="w-full sm:w-auto"
          variant="secondary"
          size="sm"
          isLoading={isLoading}
          onClick={onLoadMore}
        >
          {isError ? "再試行" : isLoading ? "読み込み中..." : "さらに表示"}
        </Button>
      )}
    </div>
  );
}
