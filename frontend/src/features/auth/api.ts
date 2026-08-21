import { api } from "@/lib/api/client";

import type {
  AuthSession,
  LoginInput,
  PasswordChangeInput,
} from "./types";

export async function login(input: LoginInput): Promise<string> {
  const response = await api.post<null>("/api/accounts/login/", input);

  return response.message;
}

export async function logout(): Promise<string> {
  const response = await api.post<null>("/api/accounts/logout/");

  return response.message;
}

export async function getCurrentSession(): Promise<AuthSession> {
  const response = await api.get<AuthSession>("/api/accounts/me/");

  return response.data;
}

/** ログイン中の利用者自身のパスワードを変更する。 */
export async function changeOwnPassword(
  input: PasswordChangeInput,
): Promise<string> {
  const response = await api.patch<null>("/api/users/me/password/", {
    current_password: input.currentPassword,
    new_password: input.newPassword,
    new_password_confirm: input.newPasswordConfirm,
  });

  return response.message;
}
