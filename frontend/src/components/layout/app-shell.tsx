"use client";

import { useState, useSyncExternalStore, type CSSProperties } from "react";

import { BottomNavigation } from "./bottom-navigation";
import { DesktopHeader } from "./desktop-header";
import { MobileHeader } from "./mobile-header";
import { MobileNavigationDrawer } from "./mobile-navigation-drawer";
import { Sidebar } from "./sidebar";
import { SidebarResizeHandle } from "./sidebar-resize-handle";
import type { AppShellProps } from "./types";
import { ThemeModeDialog } from "@/features/theme/components/theme-mode-dialog";

const SIDEBAR_COLLAPSED_STORAGE_KEY = "app-sidebar-collapsed";
const SIDEBAR_WIDTH_STORAGE_KEY = "app-sidebar-width";
const SIDEBAR_COLLAPSED_CHANGE_EVENT = "app-sidebar-collapsed-change";
const SIDEBAR_COLLAPSED_WIDTH = 64;
const SIDEBAR_MIN_EXPANDED_WIDTH = 160;
const SIDEBAR_MAX_WIDTH = 360;
const SIDEBAR_DEFAULT_WIDTH = 256;

function subscribeToSidebarCollapsed(onStoreChange: () => void) {
  window.addEventListener(SIDEBAR_COLLAPSED_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(SIDEBAR_COLLAPSED_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSidebarCollapsedSnapshot() {
  return (
    window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "true"
  );
}

function getSidebarWidthSnapshot() {
  const storedWidth = Number(
    window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY),
  );

  if (!Number.isFinite(storedWidth)) {
    return SIDEBAR_DEFAULT_WIDTH;
  }

  return Math.min(
    Math.max(storedWidth, SIDEBAR_MIN_EXPANDED_WIDTH),
    SIDEBAR_MAX_WIDTH,
  );
}

function getServerSidebarCollapsedSnapshot() {
  return false;
}

/** デスクトップとモバイルでナビゲーション配置を切り替える共通アプリ枠。 */
export function AppShell({
  appName,
  currentPath,
  currentRole,
  userName,
  roleLabel,
  navigationItems,
  settingsActions,
  onPasswordChangeRequest,
  onLogoutRequest,
  children,
}: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileThemeDialogOpen, setIsMobileThemeDialogOpen] =
    useState(false);
  const isSidebarCollapsed = useSyncExternalStore(
    subscribeToSidebarCollapsed,
    getSidebarCollapsedSnapshot,
    getServerSidebarCollapsedSnapshot,
  );
  const sidebarWidth = useSyncExternalStore(
    subscribeToSidebarCollapsed,
    getSidebarWidthSnapshot,
    () => SIDEBAR_DEFAULT_WIDTH,
  );
  const currentSidebarWidth = isSidebarCollapsed
    ? SIDEBAR_COLLAPSED_WIDTH
    : sidebarWidth;

  function notifySidebarChange() {
    window.dispatchEvent(new Event(SIDEBAR_COLLAPSED_CHANGE_EVENT));
  }

  function toggleSidebar() {
    if (isSidebarCollapsed) {
      window.localStorage.setItem(
        SIDEBAR_WIDTH_STORAGE_KEY,
        String(Math.max(sidebarWidth, SIDEBAR_DEFAULT_WIDTH)),
      );
    }

    window.localStorage.setItem(
      SIDEBAR_COLLAPSED_STORAGE_KEY,
      String(!isSidebarCollapsed),
    );
    notifySidebarChange();
  }

  function resizeSidebar(nextWidth: number) {
    if (nextWidth === SIDEBAR_COLLAPSED_WIDTH) {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, "true");
      notifySidebarChange();
      return;
    }

    window.localStorage.setItem(
      SIDEBAR_WIDTH_STORAGE_KEY,
      String(
        Math.min(
          Math.max(nextWidth, SIDEBAR_MIN_EXPANDED_WIDTH),
          SIDEBAR_MAX_WIDTH,
        ),
      ),
    );
    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, "false");
    notifySidebarChange();
  }

  return (
    <div
      className="relative h-dvh overflow-hidden bg-background text-text"
      style={
        {
          "--sidebar-width": `${currentSidebarWidth}px`,
        } as CSSProperties
      }
    >
      <MobileNavigationDrawer
        appName={appName}
        isOpen={isMobileMenuOpen}
        currentPath={currentPath}
        currentRole={currentRole}
        navigationItems={navigationItems}
        settingsActions={settingsActions}
        onThemeModeRequest={() => setIsMobileThemeDialogOpen(true)}
        onPasswordChangeRequest={onPasswordChangeRequest}
        onLogoutRequest={onLogoutRequest}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <aside
        className={[
          "fixed inset-y-0 left-0 z-30 hidden border-r border-border bg-surface transition-[width] duration-200 lg:block",
        ].join(" ")}
        style={{ width: "var(--sidebar-width)" }}
      >
        <Sidebar
          appName={appName}
          currentPath={currentPath}
          currentRole={currentRole}
          userName={userName}
          roleLabel={roleLabel}
          navigationItems={navigationItems}
          isCollapsed={isSidebarCollapsed}
          settingsActions={settingsActions}
          onCollapseToggle={toggleSidebar}
          onPasswordChangeRequest={onPasswordChangeRequest}
          onLogoutRequest={onLogoutRequest}
        />
        <SidebarResizeHandle
          isCollapsed={isSidebarCollapsed}
          sidebarWidth={sidebarWidth}
          minExpandedWidth={SIDEBAR_MIN_EXPANDED_WIDTH}
          maxWidth={SIDEBAR_MAX_WIDTH}
          collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
          onResize={resizeSidebar}
        />
      </aside>

      <MobileHeader
        appName={appName}
        userName={userName}
        roleLabel={roleLabel}
        isMenuOpen={isMobileMenuOpen}
        onMenuToggle={() => setIsMobileMenuOpen((current) => !current)}
        onMenuClose={() => setIsMobileMenuOpen(false)}
        onLogoutRequest={onLogoutRequest}
      />

      <DesktopHeader
        userName={userName}
        roleLabel={roleLabel}
        onLogoutRequest={onLogoutRequest}
      />

      <div
        id="app-content-scroll"
        className={[
          "fixed inset-x-0 top-17 bottom-20 z-10 overflow-y-auto bg-background transition-[left,transform] duration-300 ease-out lg:bottom-0",
          "lg:left-[var(--sidebar-width)]",
          isMobileMenuOpen ? "translate-x-[min(19rem,82vw)]" : "",
        ].join(" ")}
        onMouseDown={
          isMobileMenuOpen ? () => setIsMobileMenuOpen(false) : undefined
        }
      >
        <main className="mx-auto w-full max-w-screen-2xl p-page">
          {children}
        </main>
      </div>

      <div
        className={[
          "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface transition-transform duration-300 ease-out lg:hidden",
          isMobileMenuOpen ? "translate-x-[min(19rem,82vw)]" : "",
        ].join(" ")}
        onMouseDown={
          isMobileMenuOpen ? () => setIsMobileMenuOpen(false) : undefined
        }
      >
        <BottomNavigation
          currentPath={currentPath}
          currentRole={currentRole}
          navigationItems={navigationItems}
        />
      </div>

      <ThemeModeDialog
        isOpen={isMobileThemeDialogOpen}
        onClose={() => setIsMobileThemeDialogOpen(false)}
      />
    </div>
  );
}
