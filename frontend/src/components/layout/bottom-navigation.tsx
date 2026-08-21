import Link from "next/link";

import type { UserRole } from "@/features/auth/types";
import {
  canAccessNavigationItem,
  getVisibleNavigationItems,
  isCurrentNavigationLink,
} from "./navigation-utils";
import type { NavigationItem, NavigationLink } from "./types";

type BottomNavigationProps = {
  currentPath: string;
  currentRole: UserRole;
  navigationItems: NavigationItem[];
};

function BottomLink({
  item,
  currentPath,
}: {
  item: NavigationLink;
  currentPath: string;
}) {
  const Icon = item.icon;
  const isActive = isCurrentNavigationLink(currentPath, item);
  const className = [
    "flex min-h-20 flex-col items-center justify-center gap-1 px-1 text-xs font-medium",
    item.disabled
      ? "cursor-not-allowed text-text-muted opacity-50"
      : isActive
        ? "bg-primary/5 text-primary"
        : "text-text-muted",
  ].join(" ");

  if (item.disabled) {
    return (
      <span aria-disabled="true" className={className}>
        <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
        <span className="max-w-full truncate" title={item.label}>
          {item.label}
        </span>
      </span>
    );
  }

  return (
    <Link href={item.href} aria-current={isActive ? "page" : undefined} className={className}>
      <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
      <span className="max-w-full truncate" title={item.label}>
        {item.label}
      </span>
    </Link>
  );
}

/** モバイル用の固定ボトムメニュー。表示対象はメニュー定義で明示する。 */
export function BottomNavigation({
  currentPath,
  currentRole,
  navigationItems,
}: BottomNavigationProps) {
  const bottomItems = getVisibleNavigationItems(
    currentRole,
    navigationItems,
  )
    .flatMap((item) =>
      item.type === "link"
        ? [item]
        : item.children.filter((child) =>
            canAccessNavigationItem(currentRole, child),
          ),
    )
    .filter(
      (item) =>
        item.showInMobileBottom === true &&
        (item.mobileBottomRoles === undefined ||
          item.mobileBottomRoles.includes(currentRole)),
    )
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const leftOrder =
        left.item.mobileBottomOrder?.[currentRole] ?? Number.MAX_SAFE_INTEGER;
      const rightOrder =
        right.item.mobileBottomOrder?.[currentRole] ??
        Number.MAX_SAFE_INTEGER;

      return leftOrder - rightOrder || left.index - right.index;
    })
    .map(({ item }) => item);

  return (
    <nav aria-label="モバイルメニュー" className="grid grid-flow-col auto-cols-fr bg-surface">
      {bottomItems.map((item) => (
        <BottomLink key={item.href} item={item} currentPath={currentPath} />
      ))}
    </nav>
  );
}
