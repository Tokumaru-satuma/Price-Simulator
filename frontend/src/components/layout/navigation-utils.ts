import type { UserRole } from "@/features/auth/types";

import type { NavigationGroup, NavigationItem, NavigationLink } from "./types";

const ROLE_RANK: Record<UserRole, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
};

export function canAccessNavigationItem(
  currentRole: UserRole,
  item: NavigationItem,
): boolean {
  return (
    !item.requiredRole ||
    ROLE_RANK[currentRole] >= ROLE_RANK[item.requiredRole]
  );
}

export function getVisibleNavigationItems(
  currentRole: UserRole,
  navigationItems: NavigationItem[],
): NavigationItem[] {
  return navigationItems.filter((item) =>
    canAccessNavigationItem(currentRole, item),
  );
}

export function isCurrentPath(currentPath: string, href: string): boolean {
  if (href === "/") {
    return currentPath === "/";
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function isCurrentNavigationLink(
  currentPath: string,
  item: NavigationLink,
): boolean {
  return isCurrentPath(currentPath, item.href);
}

export function isCurrentNavigationGroup(
  currentPath: string,
  item: NavigationGroup,
): boolean {
  return item.children.some((child) =>
    isCurrentNavigationLink(currentPath, child),
  );
}

export function isCurrentNavigationItem(
  currentPath: string,
  item: NavigationItem,
): boolean {
  return item.type === "link"
    ? isCurrentNavigationLink(currentPath, item)
    : isCurrentNavigationGroup(currentPath, item);
}
