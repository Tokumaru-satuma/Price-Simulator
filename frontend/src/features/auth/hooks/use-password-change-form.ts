"use client";

import { useState } from "react";

import { ApiError } from "@/lib/api/error";

import { useChangeOwnPassword } from "../mutations";

type UsePasswordChangeFormOptions = {
  onSuccess: (message: string) => void;
};

/** パスワード変更フォームの入力値・検証・送信を管理する。 */
export function usePasswordChangeForm({
  onSuccess,
}: UsePasswordChangeFormOptions) {
  const mutation = useChangeOwnPassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function validateInputs(): boolean {
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      setErrorMessage("すべての項目を入力してください。");
      return false;
    }

    if (newPassword !== newPasswordConfirm) {
      setErrorMessage("新しいパスワードが一致しません。");
      return false;
    }

    setErrorMessage(null);
    return true;
  }

  async function submit() {
    setErrorMessage(null);

    try {
      const message = await mutation.mutateAsync({
        currentPassword,
        newPassword,
        newPasswordConfirm,
      });

      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      onSuccess(message);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "パスワードを変更できませんでした。時間をおいて再度お試しください。",
      );
    }
  }

  function reset() {
    if (mutation.isPending) {
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirm("");
    setErrorMessage(null);
  }

  return {
    currentPassword,
    newPassword,
    newPasswordConfirm,
    errorMessage,
    isSubmitting: mutation.isPending,
    setCurrentPassword,
    setNewPassword,
    setNewPasswordConfirm,
    validateInputs,
    submit,
    reset,
  };
}
