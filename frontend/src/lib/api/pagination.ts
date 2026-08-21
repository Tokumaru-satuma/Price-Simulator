import type { PaginatedData } from "./types";

/** API の next 有無から TanStack Query の次ページ番号を返す。 */
export function getNextPageParam<T>(lastPage: PaginatedData<T>) {
  return lastPage.pagination.next === null
    ? undefined
    : lastPage.pagination.page + 1;
}

/** Infinite Query の各ページを表示用の単一配列へ結合する。 */
export function flattenPaginatedItems<T>(
  pages: PaginatedData<T>[] | undefined,
): T[] {
  return pages?.flatMap((page) => page.items) ?? [];
}

/** 読み込み済みページの総件数を返す。 */
export function getPaginatedTotalCount<T>(
  pages: PaginatedData<T>[] | undefined,
): number {
  return pages?.[0]?.pagination.count ?? 0;
}

/** 選択肢など全件が必要な用途で、APIを最終ページまで順に取得する。 */
export async function fetchAllPaginatedItems<T>(
  fetchPage: (page: number) => Promise<PaginatedData<T>>,
): Promise<T[]> {
  const items: T[] = [];
  let page = 1;

  while (true) {
    const data = await fetchPage(page);
    items.push(...data.items);

    if (data.pagination.next === null) return items;
    page += 1;
  }
}
