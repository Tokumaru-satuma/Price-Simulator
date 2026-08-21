"use client";

import {
  CarFront,
  ChevronDown,
  ChevronRight,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

import { Tooltip } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/features/auth/types";

import {
  getVisibleNavigationItems,
  isCurrentNavigationItem,
  isCurrentNavigationLink,
} from "./navigation-utils";
import { AppSettingsMenu } from "./app-settings-menu";
import type {
  NavigationGroup,
  NavigationItem,
  NavigationLink,
  SettingsAction,
} from "./types";

type SidebarProps = {
  appName: string;
  currentPath: string;
  currentRole: UserRole;
  userName: string;
  roleLabel: string;
  navigationItems: NavigationItem[];
  isCollapsed: boolean;
  settingsActions?: readonly SettingsAction[];
  onCollapseToggle: () => void;
  onPasswordChangeRequest: () => void;
  onLogoutRequest: () => void;
};

function SidebarTooltip({
  isCollapsed,
  label,
  children,
}: {
  isCollapsed: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (!isCollapsed) {
    return children;
  }

  return <Tooltip content={label}>{children}</Tooltip>;
}

function NavigationLinkItem({
  item,
  currentPath,
  nested = false,
  isCollapsed = false,
  onNavigate,
}: {
  item: NavigationLink;
  currentPath: string;
  nested?: boolean;
  isCollapsed?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const isActive = isCurrentNavigationLink(currentPath, item);
  const className = [
    "flex items-center rounded-card py-control-y text-sm font-medium transition",
    isCollapsed ? "size-10 justify-center p-0" : "gap-3 px-control-x",
    nested && !isCollapsed && "ml-stack-md",
    item.disabled
      ? "cursor-not-allowed text-text-muted opacity-50"
      : isActive
        ? "bg-primary text-primary-foreground"
        : "text-text-muted hover:bg-surface-muted hover:text-text",
  ]
    .filter(Boolean)
    .join(" ");
  const itemContent = (
    <>
      <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
      {!isCollapsed && (
        <span className="min-w-0 flex-1 truncate" title={item.label}>
          {item.label}
        </span>
      )}
    </>
  );

  if (item.disabled) {
    return (
      <SidebarTooltip isCollapsed={isCollapsed} label={item.label}>
        <span aria-disabled="true" aria-label={item.label} className={className}>
          {itemContent}
        </span>
      </SidebarTooltip>
    );
  }

  return (
    <SidebarTooltip isCollapsed={isCollapsed} label={item.label}>
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        aria-label={isCollapsed ? item.label : undefined}
        className={className}
        onClick={onNavigate}
      >
        {itemContent}
      </Link>
    </SidebarTooltip>
  );
}

function NavigationGroupItem({
  item,
  currentPath,
  expanded,
  isCollapsed,
  isFlyoutOpen,
  onToggle,
  onCloseFlyout,
}: {
  item: NavigationGroup;
  currentPath: string;
  expanded: boolean;
  isCollapsed: boolean;
  isFlyoutOpen: boolean;
  onToggle: () => void;
  onCloseFlyout: () => void;
}) {
  const groupRef = useRef<HTMLDivElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const [flyoutPosition, setFlyoutPosition] = useState({ top: 0, left: 0 });
  const Icon = item.icon;
  const isActive = isCurrentNavigationItem(currentPath, item);
  const ToggleIcon = expanded ? ChevronDown : ChevronRight;

  useEffect(() => {
    if (!isFlyoutOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        !groupRef.current?.contains(target) &&
        !flyoutRef.current?.contains(target)
      ) {
        onCloseFlyout();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseFlyout();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("scroll", onCloseFlyout, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("scroll", onCloseFlyout, true);
    };
  }, [isFlyoutOpen, onCloseFlyout]);

  function handleToggle() {
    if (isCollapsed && !isFlyoutOpen) {
      const rect = groupRef.current?.getBoundingClientRect();

      setFlyoutPosition({
        top: rect?.top ?? 0,
        left: (rect?.right ?? 0) + 12,
      });
    }

    onToggle();
  }

  const buttonClassName = [
    "flex items-center rounded-card py-control-y text-left text-sm font-medium transition",
    isCollapsed ? "size-10 justify-center p-0" : "w-full gap-3 px-control-x",
    item.disabled
      ? "cursor-not-allowed text-text-muted opacity-50"
      : isActive
        ? "bg-surface-muted text-text"
        : "text-text-muted hover:bg-surface-muted hover:text-text",
  ].join(" ");
  const buttonContent = (
    <>
      <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
      {!isCollapsed && (
        <>
          <span className="min-w-0 flex-1 truncate" title={item.label}>
            {item.label}
          </span>
          <ToggleIcon aria-hidden="true" size={16} />
        </>
      )}
    </>
  );

  return (
    <div ref={groupRef} className="relative">
      <SidebarTooltip isCollapsed={isCollapsed} label={item.label}>
        <button
          type="button"
          aria-label={isCollapsed ? item.label : undefined}
          aria-expanded={isCollapsed ? isFlyoutOpen : expanded}
          aria-haspopup={isCollapsed ? "menu" : undefined}
          className={buttonClassName}
          disabled={item.disabled}
          onClick={handleToggle}
        >
          {buttonContent}
        </button>
      </SidebarTooltip>

      {!isCollapsed && expanded && (
        <div className="mt-stack-xs space-y-stack-xs">
          {item.children.map((child) => (
            <NavigationLinkItem
              key={child.href}
              item={child}
              currentPath={currentPath}
              nested
            />
          ))}
        </div>
      )}

      {isCollapsed &&
        isFlyoutOpen &&
        createPortal(
          <div
            ref={flyoutRef}
            role="menu"
            aria-label={item.label}
            className="fixed z-50 w-56 rounded-dialog border border-border bg-surface p-2 shadow-dialog"
            style={flyoutPosition}
          >
            <p className="px-control-x py-control-y text-sm font-semibold text-text">
              {item.label}
            </p>
            <div className="space-y-stack-xs">
              {item.children.map((child) => (
                <NavigationLinkItem
                  key={child.href}
                  item={child}
                  currentPath={currentPath}
                  onNavigate={onCloseFlyout}
                />
              ))}
            </div>
          </div>
          ,
          document.body,
        )}
    </div>
  );
}

/** デスクトップ画面用の展開式サイドバー。 */
export function Sidebar({
  appName,
  currentPath,
  currentRole,
  userName,
  roleLabel,
  navigationItems,
  isCollapsed,
  settingsActions,
  onCollapseToggle,
  onPasswordChangeRequest,
  onLogoutRequest,
}: SidebarProps) {
  const [expandedGroupLabels, setExpandedGroupLabels] = useState<string[]>([]);
  const [flyoutGroupLabel, setFlyoutGroupLabel] = useState<string | null>(
    null,
  );
  const visibleItems = getVisibleNavigationItems(currentRole, navigationItems);

  function toggleGroup(label: string) {
    if (isCollapsed) {
      setFlyoutGroupLabel((currentLabel) =>
        currentLabel === label ? null : label,
      );
      return;
    }

    setExpandedGroupLabels((currentLabels) =>
      currentLabels.includes(label)
        ? currentLabels.filter((currentLabel) => currentLabel !== label)
        : [...currentLabels, label],
    );
  }

  function handleCollapseToggle() {
    setFlyoutGroupLabel(null);
    onCollapseToggle();
  }

  return (
    <div
      className={[
        "flex h-full flex-col",
        isCollapsed ? "p-2" : "p-stack-md",
      ].join(" ")}
    >
      <div
        className={[
          isCollapsed
            ? "-mx-2 -mt-2 flex min-h-[4.25rem] items-center justify-center bg-primary px-2 text-primary-foreground"
            : "-mx-stack-md -mt-stack-md flex min-h-[4.25rem] items-center bg-primary pl-[calc(var(--spacing-stack-md)+var(--spacing-stack-xs))] pr-stack-md text-primary-foreground",
        ].join(" ")}
      >
        <SidebarTooltip isCollapsed={isCollapsed} label={appName}>
          <div className="flex min-w-0 items-center gap-3">
            <CarFront aria-hidden="true" size={20} />
            {!isCollapsed && (
              <p className="truncate text-base font-semibold">{appName}</p>
            )}
          </div>
        </SidebarTooltip>
      </div>

      <nav
        aria-label="メインメニュー"
        className={[
          "mt-stack-md min-h-0 flex-1 space-y-stack-xs overflow-x-hidden overflow-y-auto overscroll-contain",
          isCollapsed
            ? "flex flex-col items-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "pr-1",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <SidebarTooltip
          isCollapsed={isCollapsed}
          label={isCollapsed ? "サイドメニューを展開" : "サイドメニューを最小化"}
        >
          <Button
            aria-label={
              isCollapsed ? "サイドメニューを展開" : "サイドメニューを最小化"
            }
            variant="ghost"
            size="sm"
            className="size-10 p-0"
            onClick={handleCollapseToggle}
          >
            {isCollapsed ? (
              <PanelLeftOpen aria-hidden="true" size={18} />
            ) : (
              <PanelLeftClose aria-hidden="true" size={18} />
            )}
          </Button>
        </SidebarTooltip>
        {visibleItems.map((item) =>
          item.type === "link" ? (
            <NavigationLinkItem
              key={item.href}
              item={item}
              currentPath={currentPath}
              isCollapsed={isCollapsed}
            />
          ) : (
            <NavigationGroupItem
              key={item.label}
              item={item}
              currentPath={currentPath}
              expanded={
                isCurrentNavigationItem(currentPath, item) ||
                expandedGroupLabels.includes(item.label)
              }
              isCollapsed={isCollapsed}
              isFlyoutOpen={flyoutGroupLabel === item.label}
              onToggle={() => toggleGroup(item.label)}
              onCloseFlyout={() => setFlyoutGroupLabel(null)}
            />
          ),
        )}
      </nav>

      <div
        className={[
          "mt-auto border-t border-border pt-stack-md",
          isCollapsed && "flex flex-col items-center",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {!isCollapsed && (
          <div className="min-w-0 px-stack-sm">
            <p className="truncate text-sm font-medium text-text" title={userName}>
              {userName}
            </p>
            <p
              className="mt-stack-xs truncate text-xs text-text-muted"
              title={roleLabel}
            >
              {roleLabel}
            </p>
          </div>
        )}
        <div className={isCollapsed ? "mt-stack-sm" : "mt-stack-sm px-stack-sm"}>
          <AppSettingsMenu
            compact={isCollapsed}
            settingsActions={settingsActions}
            onPasswordChangeRequest={onPasswordChangeRequest}
          />
        </div>
        <SidebarTooltip isCollapsed={isCollapsed} label="ログアウト">
          <Button
            variant="ghost"
            size="sm"
            aria-label={isCollapsed ? "ログアウト" : undefined}
            className={[
              "mt-stack-sm",
              isCollapsed ? "size-10 p-0" : "w-full min-w-0 justify-start",
            ].join(" ")}
            onClick={onLogoutRequest}
          >
            <LogOut aria-hidden="true" className="shrink-0" size={18} />
            {!isCollapsed && <span className="truncate">ログアウト</span>}
          </Button>
        </SidebarTooltip>
      </div>
    </div>
  );
}
