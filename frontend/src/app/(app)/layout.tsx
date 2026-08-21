import type { ReactNode } from "react";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { ProjectAppShell } from "@/features/app/components/app-shell";

type AppLayoutProps = {
  children: ReactNode;
};

/** 認証済み利用者だけが閲覧できる画面群の共通レイアウト。 */
export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <AuthGuard>
      <ProjectAppShell>{children}</ProjectAppShell>
    </AuthGuard>
  );
}
