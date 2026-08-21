"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

import { useCurrentSession } from "@/features/auth/queries";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PasswordChangeDialog } from "@/features/auth/components/password-change-dialog";
import { useLogoutAction } from "@/features/auth/hooks/use-logout-action";

import { AppShell } from "./app-shell";
import type { NavigationItem } from "./types";

type AuthenticatedAppShellProps = {
  appName: string;
  navigationItems: NavigationItem[];
  children: ReactNode;
};

/** 認証済み利用者の情報と共通アプリ枠を接続するコンテナ。 */
export function AuthenticatedAppShell({
  appName,
  navigationItems,
  children,
}: AuthenticatedAppShellProps) {
  const pathname = usePathname();
  const sessionQuery = useCurrentSession();
  const logoutAction = useLogoutAction();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!noticeMessage) {
      return;
    }

    const timerId = window.setTimeout(() => setNoticeMessage(null), 5000);

    return () => window.clearTimeout(timerId);
  }, [noticeMessage]);

  // AuthGuard が認証確認済みの画面を包むため、通常は必ず data を持つ。
  if (!sessionQuery.data) {
    return null;
  }

  return (
    <>
      <AppShell
        appName={appName}
        currentPath={pathname}
        currentRole={sessionQuery.data.user.role}
        userName={sessionQuery.data.user.name}
        roleLabel={sessionQuery.data.user.role_label}
        navigationItems={navigationItems}
        onPasswordChangeRequest={() => setIsPasswordDialogOpen(true)}
        onLogoutRequest={logoutAction.requestLogout}
      >
        {children}
      </AppShell>

      <PasswordChangeDialog
        isOpen={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
        onSuccess={setNoticeMessage}
      />

      <ConfirmDialog
        isOpen={logoutAction.isConfirmationOpen}
        title="ログアウトしますか？"
        description={
          <>
            <p>ログアウトすると、再度ログインが必要です。</p>
            {logoutAction.errorMessage && (
              <p role="alert" className="mt-stack-sm text-danger">
                {logoutAction.errorMessage}
              </p>
            )}
          </>
        }
        confirmLabel="ログアウト"
        variant="danger"
        isConfirming={logoutAction.isSubmitting}
        onCancel={logoutAction.cancelLogout}
        onConfirm={() => {
          void logoutAction.confirmLogout();
        }}
      />

      {noticeMessage && (
        <p
          role="status"
          className="fixed right-page top-20 z-40 rounded-card border border-border bg-surface px-stack-md py-stack-sm text-sm text-success shadow-card"
        >
          {noticeMessage}
        </p>
      )}
    </>
  );
}
