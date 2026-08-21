"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiError } from "@/lib/api/error";

import { useLogout } from "../mutations";

/** ログアウト確認・実行・画面遷移を一か所にまとめる。 */
export function useLogoutAction() {
  const router = useRouter();
  const logoutMutation = useLogout();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function requestLogout() {
    setErrorMessage(null);
    setIsConfirmationOpen(true);
  }

  function cancelLogout() {
    if (!logoutMutation.isPending) {
      setIsConfirmationOpen(false);
    }
  }

  async function confirmLogout() {
    setErrorMessage(null);

    try {
      await logoutMutation.mutateAsync();
      router.replace("/login");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "ログアウトに失敗しました。時間をおいて再度お試しください。",
      );
    }
  }

  return {
    isConfirmationOpen,
    isSubmitting: logoutMutation.isPending,
    errorMessage,
    requestLogout,
    cancelLogout,
    confirmLogout,
  };
}
