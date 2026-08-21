"use client";

import { ChevronRight, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useTheme } from "@/features/theme/theme-provider";
import type { ThemeMode } from "@/features/theme/types";

import type { SettingsAction } from "./types";

type AppSettingsMenuProps = {
  compact?: boolean;
  settingsActions?: readonly SettingsAction[];
  onPasswordChangeRequest: () => void;
};

const THEME_MODE_ITEMS: ReadonlyArray<{ value: ThemeMode; label: string }> = [
  { value: "system", label: "システム設定に合わせる" },
  { value: "light", label: "ライト" },
  { value: "dark", label: "ダーク" },
];

/** サイドバー下部から開く、利用者向け設定メニュー。 */
export function AppSettingsMenu({
  compact = false,
  settingsActions,
  onPasswordChangeRequest,
}: AppSettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { mode, setMode } = useTheme();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setIsThemeMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  function closeMenu() {
    setIsOpen(false);
    setIsThemeMenuOpen(false);
  }

  function selectThemeMode(nextMode: ThemeMode) {
    setMode(nextMode);
    closeMenu();
  }

  function requestPasswordChange() {
    closeMenu();
    onPasswordChangeRequest();
  }

  function requestSettingsAction(action: SettingsAction) {
    closeMenu();
    action.onSelect();
  }

  return (
    <div ref={menuRef} className="relative">
      {compact ? (
        <Tooltip content="設定">
          <Button
            variant="ghost"
            size="sm"
            className="size-10 p-0"
            aria-label="設定"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((current) => !current)}
          >
            <Settings aria-hidden="true" size={18} />
          </Button>
        </Tooltip>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          <Settings aria-hidden="true" size={18} />
          <span className="truncate">設定</span>
        </Button>
      )}

      {isOpen && (
        <section
          aria-label="設定メニュー"
          className={[
            "absolute z-40 w-72 rounded-card border border-border bg-surface p-stack-sm shadow-dialog",
            compact
              ? "bottom-0 left-full ml-stack-sm"
              : "bottom-full left-0 mb-stack-sm",
          ].join(" ")}
        >
          <div className="relative space-y-stack-xs">
            <Button
              variant="ghost"
              size="sm"
              className="w-full min-w-0 justify-start"
              onClick={() => setIsThemeMenuOpen((current) => !current)}
            >
              <span className="min-w-0 flex-1 truncate text-left">
                表示テーマ
              </span>
              <ChevronRight aria-hidden="true" className="shrink-0" size={18} />
            </Button>

            {isThemeMenuOpen && (
              <section
                aria-label="表示テーマ"
                className="absolute bottom-0 left-full z-50 ml-stack-sm w-72 rounded-card border border-border bg-surface p-stack-sm shadow-dialog"
              >
                <p className="px-control-x py-control-y text-sm font-medium text-text">
                  表示テーマ
                </p>
                <div className="space-y-stack-xs">
                  {THEME_MODE_ITEMS.map((item) => (
                    <Button
                      key={item.value}
                      variant="ghost"
                      size="sm"
                      className="w-full min-w-0 justify-start"
                      onClick={() => selectThemeMode(item.value)}
                    >
                      <span className="min-w-0 flex-1 truncate text-left">
                        {item.label}
                      </span>
                      {mode === item.value && (
                        <span aria-label="選択中" className="shrink-0">
                          ✓
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </section>
            )}

            {settingsActions?.map((action) => (
              <Button
                key={action.id}
                variant="ghost"
                size="sm"
                className="w-full min-w-0 justify-start"
                onClick={() => requestSettingsAction(action)}
              >
                <span className="min-w-0 flex-1 truncate text-left">
                  {action.label}
                </span>
                <ChevronRight aria-hidden="true" className="shrink-0" size={18} />
              </Button>
            ))}

            <Button
              variant="ghost"
              size="sm"
              className="w-full min-w-0 justify-start"
              onClick={requestPasswordChange}
            >
              <span className="min-w-0 flex-1 truncate text-left">
                パスワード変更
              </span>
              <ChevronRight aria-hidden="true" className="shrink-0" size={18} />
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
