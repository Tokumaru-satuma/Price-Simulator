"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { changeOwnPassword, login, logout } from "./api";
import { currentSessionQueryOptions } from "./queries";
import type { LoginInput, PasswordChangeInput } from "./types";

/** ログインし、成功後に現在の利用者情報を Query キャッシュへ取得する。 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: async () => {
      await queryClient.fetchQuery(currentSessionQueryOptions());
    },
  });
}

/** ログアウトし、利用者に紐づくすべての Query キャッシュを削除する。 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

/** ログイン中の利用者自身のパスワードを変更する。 */
export function useChangeOwnPassword() {
  return useMutation({
    mutationFn: (input: PasswordChangeInput) => changeOwnPassword(input),
  });
}
