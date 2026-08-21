import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { UserRole } from "@/features/auth/types";

type NavigationBase = {
  label: string;
  icon: LucideIcon;
  requiredRole?: UserRole;
  disabled?: boolean;
  /** モバイルの固定ボトムメニューに表示する項目だけ明示する。 */
  showInMobileBottom?: boolean;
  /** 固定ボトムメニューへ表示するロールを限定する。未指定時は表示可能な全ロール。 */
  mobileBottomRoles?: readonly UserRole[];
  /** ロールごとの固定ボトムメニュー表示順。値が小さいほど先に表示する。 */
  mobileBottomOrder?: Partial<Record<UserRole, number>>;
};

export type NavigationLink = NavigationBase & {
  type: "link";
  href: string;
};

export type NavigationGroup = NavigationBase & {
  type: "group";
  children: NavigationLink[];
};

export type NavigationItem = NavigationLink | NavigationGroup;

export type SettingsAction = {
  id: string;
  label: string;
  onSelect: () => void;
};

export type AppShellProps = {
  appName: string;
  currentPath: string;
  currentRole: UserRole;
  userName: string;
  roleLabel: string;
  navigationItems: NavigationItem[];
  settingsActions?: readonly SettingsAction[];
  onPasswordChangeRequest: () => void;
  onLogoutRequest: () => void;
  children: ReactNode;
};
