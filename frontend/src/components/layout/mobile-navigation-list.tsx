"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { isCurrentNavigationItem, isCurrentNavigationLink } from "./navigation-utils";
import type { NavigationGroup, NavigationItem, NavigationLink } from "./types";

type MobileNavigationListProps = {
  currentPath: string;
  navigationItems: NavigationItem[];
  onNavigate: () => void;
};

/** モバイルドロワー内の画面遷移メニュー。グループの展開状態だけを管理する。 */
export function MobileNavigationList({
  currentPath,
  navigationItems,
  onNavigate,
}: MobileNavigationListProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  function toggleGroup(label: string) {
    setExpandedGroups((current) =>
      current.includes(label)
        ? current.filter((value) => value !== label)
        : [...current, label],
    );
  }

  return (
    <nav aria-label="メインメニュー" className="mt-stack-md space-y-stack-xs">
      {navigationItems.map((item) =>
        item.type === "link" ? (
          <NavigationLinkItem
            key={item.href}
            item={item}
            currentPath={currentPath}
            onNavigate={onNavigate}
          />
        ) : (
          <NavigationGroupItem
            key={item.label}
            item={item}
            currentPath={currentPath}
            expanded={
              isCurrentNavigationItem(currentPath, item) ||
              expandedGroups.includes(item.label)
            }
            onToggle={() => toggleGroup(item.label)}
            onNavigate={onNavigate}
          />
        ),
      )}
    </nav>
  );
}

function NavigationLinkItem({
  item,
  currentPath,
  onNavigate,
  nested = false,
}: {
  item: NavigationLink;
  currentPath: string;
  onNavigate: () => void;
  nested?: boolean;
}) {
  const Icon = item.icon;
  const isActive = isCurrentNavigationLink(currentPath, item);
  const className = [
    "flex w-full items-center gap-3 rounded-control px-control-x py-control-y text-sm font-medium",
    nested && "ml-stack-md w-[calc(100%-var(--spacing-stack-md))]",
    item.disabled
      ? "cursor-not-allowed text-text-muted opacity-50"
      : isActive
        ? "bg-primary text-primary-foreground"
        : "text-text-muted hover:bg-surface-muted hover:text-text",
  ]
    .filter(Boolean)
    .join(" ");

  if (item.disabled) {
    return (
      <span aria-disabled="true" className={className}>
        <Icon aria-hidden="true" size={18} />
        <span className="min-w-0 flex-1 truncate" title={item.label}>
          {item.label}
        </span>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={className}
      onClick={onNavigate}
    >
      <Icon aria-hidden="true" size={18} />
      <span className="min-w-0 flex-1 truncate" title={item.label}>
        {item.label}
      </span>
    </Link>
  );
}

function NavigationGroupItem({
  item,
  currentPath,
  expanded,
  onToggle,
  onNavigate,
}: {
  item: NavigationGroup;
  currentPath: string;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  const ToggleIcon = expanded ? ChevronDown : ChevronRight;

  return (
    <div>
      <button
        type="button"
        disabled={item.disabled}
        aria-expanded={expanded}
        onClick={onToggle}
        className="flex w-full items-center gap-3 rounded-control px-control-x py-control-y text-left text-sm font-medium text-text-muted hover:bg-surface-muted hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon aria-hidden="true" size={18} />
        <span className="min-w-0 flex-1 truncate" title={item.label}>
          {item.label}
        </span>
        <ToggleIcon aria-hidden="true" size={16} />
      </button>
      {expanded && (
        <div className="mt-stack-xs space-y-stack-xs">
          {item.children.map((child) => (
            <NavigationLinkItem
              key={child.href}
              item={child}
              currentPath={currentPath}
              onNavigate={onNavigate}
              nested
            />
          ))}
        </div>
      )}
    </div>
  );
}
