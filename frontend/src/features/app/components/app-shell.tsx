"use client";

import type { ReactNode } from "react";

import { AuthenticatedAppShell } from "@/components/layout/authenticated-app-shell";

import { appNavigationItems } from "../navigation";

type ProjectAppShellProps = {
  children: ReactNode;
};

/** プロジェクト固有のメニュー定義と、汎用の認証済みアプリ枠を接続する。 */
export function ProjectAppShell({ children }: ProjectAppShellProps) {
  return (
    <AuthenticatedAppShell appName="アプリケーション" navigationItems={appNavigationItems}>
      {children}
    </AuthenticatedAppShell>
  );
}
