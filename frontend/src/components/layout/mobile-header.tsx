import { LogOut } from "lucide-react";

type MobileHeaderProps = {
  appName: string;
  userName: string;
  roleLabel: string;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  onMenuClose: () => void;
  onLogoutRequest: () => void;
};

/** モバイル画面のアプリ名・利用者情報・ハンバーガーメニューを表示する共通ヘッダー。 */
export function MobileHeader({
  appName,
  userName,
  roleLabel,
  isMenuOpen,
  onMenuToggle,
  onMenuClose,
  onLogoutRequest,
}: MobileHeaderProps) {
  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-40 flex min-h-[4.25rem] items-center justify-between bg-primary px-page text-primary-foreground transition-transform duration-300 ease-out lg:hidden",
        isMenuOpen ? "translate-x-[min(19rem,82vw)]" : "",
      ].join(" ")}
      onMouseDown={isMenuOpen ? onMenuClose : undefined}
    >
      <div className="flex items-center gap-stack-xs">
        <button
          type="button"
          aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={isMenuOpen}
          className="flex size-9 items-center justify-center rounded-control text-primary-foreground hover:bg-primary-hover"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={onMenuToggle}
        >
          <span aria-hidden="true" className="text-xl leading-none">
            {isMenuOpen ? "×" : "☰"}
          </span>
        </button>
        <p className="font-semibold tracking-tight">{appName}</p>
      </div>
      <div className="flex items-center gap-stack-xs">
        <div className="text-right">
          <p className="text-xs font-medium">{userName}</p>
          <p className="text-xs text-primary-foreground/80">{roleLabel}</p>
        </div>
        <button
          type="button"
          aria-label="ログアウト"
          className="flex size-9 items-center justify-center rounded-control text-primary-foreground hover:bg-primary-hover"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={onLogoutRequest}
        >
          <LogOut aria-hidden="true" size={19} />
        </button>
      </div>
    </header>
  );
}
