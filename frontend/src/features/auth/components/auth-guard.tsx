"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { ApiError } from "@/lib/api/error";

import { useCurrentSession } from "../queries";

type AuthGuardProps = {
  children: ReactNode;
};

/**
 * 認証必須画面を保護する。
 * 401 はログイン画面へ遷移し、通信・サーバー障害は再試行可能なエラー表示にする。
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const sessionQuery = useCurrentSession();

  const isUnauthenticated =
    sessionQuery.error instanceof ApiError &&
    sessionQuery.error.status === 401;

  useEffect(() => {
    if (!isUnauthenticated) {
      return;
    }

    const nextPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
  }, [isUnauthenticated, router]);

  if (sessionQuery.isPending) {
    return <LoadingState message="ログイン状態を確認しています..." />;
  }

  if (isUnauthenticated) {
    return <LoadingState message="ログイン画面へ移動しています..." />;
  }

  if (sessionQuery.isError) {
    return (
      <ErrorState
        title="認証状態を確認できませんでした"
        message="通信状況を確認して、再試行してください。"
        onRetry={() => {
          void sessionQuery.refetch();
        }}
      />
    );
  }

  return children;
}
