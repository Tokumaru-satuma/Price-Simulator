"use client";

import { useState } from "react";

import { ApiError } from "@/lib/api/error";

import { useLogin } from "../mutations";

type UseLoginFormOptions = {
  onSuccess: () => void;
};

/** ログインフォームの入力値・送信処理・エラー表示を管理する。 */
export function useLoginForm({ onSuccess }: UseLoginFormOptions) {
  const loginMutation = useLogin();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submit() {
    const normalizedUsername = username.trim();

    if (!normalizedUsername || !password) {
      setErrorMessage("ユーザー名とパスワードを入力してください。");
      return;
    }

    setErrorMessage(null);

    try {
      await loginMutation.mutateAsync({
        username: normalizedUsername,
        password,
      });

      onSuccess();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
        return;
      }

      setErrorMessage("ログインに失敗しました。時間をおいて再度お試しください。");
    }
  }

  return {
    username,
    password,
    errorMessage,
    isSubmitting: loginMutation.isPending,
    setUsername,
    setPassword,
    submit,
  };
}
