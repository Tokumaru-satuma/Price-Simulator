"use client";

import { ChevronRight, LogOut, Settings } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import type { SettingsAction } from "./types";

type MobileNavigationSettingsProps = {
  settingsActions?: readonly SettingsAction[];
  onThemeModeRequest: () => void;
  onPasswordChangeRequest: () => void;
  onLogoutRequest: () => void;
};

/** モバイルドロワー内の共通設定・ログアウト操作。 */
export function MobileNavigationSettings({
  settingsActions,
  onThemeModeRequest,
  onPasswordChangeRequest,
  onLogoutRequest,
}: MobileNavigationSettingsProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="mt-stack-md border-t border-border pt-stack-md">
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => setIsSettingsOpen((current) => !current)}
      >
        <Settings aria-hidden="true" size={18} />
        <span className="flex-1 text-left">設定</span>
        <ChevronRight
          aria-hidden="true"
          size={18}
          className={isSettingsOpen ? "rotate-90 transition-transform" : "transition-transform"}
        />
      </Button>

      {isSettingsOpen && (
        <div className="mt-stack-xs space-y-stack-xs border-l border-border pl-stack-sm">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={onThemeModeRequest}
          >
            <span className="flex-1 text-left">表示テーマ</span>
            <ChevronRight aria-hidden="true" size={18} />
          </Button>
          {settingsActions?.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={action.onSelect}
            >
              <span className="flex-1 text-left">{action.label}</span>
              <ChevronRight aria-hidden="true" size={18} />
            </Button>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={onPasswordChangeRequest}
          >
            <span className="flex-1 text-left">パスワード変更</span>
            <ChevronRight aria-hidden="true" size={18} />
          </Button>
        </div>
      )}

      <Button
        variant="ghost"
        className="mt-stack-sm w-full justify-start"
        onClick={onLogoutRequest}
      >
        <LogOut aria-hidden="true" size={18} />
        ログアウト
      </Button>
    </div>
  );
}
