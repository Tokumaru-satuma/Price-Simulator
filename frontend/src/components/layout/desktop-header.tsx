import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

type DesktopHeaderProps = {
  userName: string;
  roleLabel: string;
  onLogoutRequest: () => void;
};

/** デスクトップ画面でテーマ・ユーザー情報を表示する共通ヘッダー。 */
export function DesktopHeader({
  userName,
  roleLabel,
  onLogoutRequest,
}: DesktopHeaderProps) {
  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-30 hidden min-h-[4.25rem] items-center justify-end border-b border-border bg-surface px-stack-xl transition-[left] duration-200 lg:flex",
        "lg:left-[var(--sidebar-width)]",
      ].join(" ")}
    >
      <div className="flex items-center gap-stack-lg">
        <div className="text-right">
          <p className="text-sm font-medium text-text">{userName}</p>
          <p className="text-xs text-text-muted">{roleLabel}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogoutRequest}>
          <LogOut aria-hidden="true" size={18} />
          ログアウト
        </Button>
      </div>
    </header>
  );
}
