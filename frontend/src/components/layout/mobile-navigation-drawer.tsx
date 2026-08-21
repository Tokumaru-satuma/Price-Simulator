"use client";

import type { UserRole } from "@/features/auth/types";

import { getVisibleNavigationItems } from "./navigation-utils";
import { MobileNavigationList } from "./mobile-navigation-list";
import { MobileNavigationSettings } from "./mobile-navigation-settings";
import type { NavigationItem, SettingsAction } from "./types";

type MobileNavigationDrawerProps = {
  appName: string;
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  currentRole: UserRole;
  navigationItems: NavigationItem[];
  settingsActions?: readonly SettingsAction[];
  onThemeModeRequest: () => void;
  onPasswordChangeRequest: () => void;
  onLogoutRequest: () => void;
};

/** モバイルのハンバーガーメニュー。画面遷移と共通操作を一か所に集約する。 */
export function MobileNavigationDrawer({
  appName,
  isOpen,
  onClose,
  currentPath,
  currentRole,
  navigationItems,
  settingsActions,
  onThemeModeRequest,
  onPasswordChangeRequest,
  onLogoutRequest,
}: MobileNavigationDrawerProps) {
  const visibleItems = getVisibleNavigationItems(currentRole, navigationItems);
  const mobileSettingsActions = settingsActions?.map((action) => ({
    ...action,
    onSelect: () => {
      onClose();
      action.onSelect();
    },
  }));

  function requestPasswordChange() {
    onClose();
    onPasswordChangeRequest();
  }

  function requestThemeMode() {
    onClose();
    onThemeModeRequest();
  }

  function requestLogout() {
    onClose();
    onLogoutRequest();
  }

  if (!isOpen) {
    return null;
  }

  return (
    <aside
      aria-label="モバイルメニュー"
      className="fixed inset-y-0 left-0 z-0 w-[min(19rem,82vw)] overflow-y-auto overscroll-contain border-r border-border bg-surface p-stack-md lg:hidden"
    >
      <div className="flex min-h-[4.25rem] items-center">
        <p className="font-semibold text-text">{appName}</p>
      </div>

      <MobileNavigationList
        currentPath={currentPath}
        navigationItems={visibleItems}
        onNavigate={onClose}
      />
      <MobileNavigationSettings
        settingsActions={mobileSettingsActions}
        onThemeModeRequest={requestThemeMode}
        onPasswordChangeRequest={requestPasswordChange}
        onLogoutRequest={requestLogout}
      />
    </aside>
  );
}
