/** 認証領域で使用する TanStack Query のキー。 */
export const authQueryKeys = {
  all: ["auth"] as const,

  me: () => [...authQueryKeys.all, "me"] as const,
};
