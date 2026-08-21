"use client";

import { Check } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

import { useTheme } from "../theme-provider";
import type { ThemeMode } from "../types";

type ThemeModeDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const THEME_MODE_ITEMS: ReadonlyArray<{ value: ThemeMode; label: string }> = [
  { value: "system", label: "システム設定に合わせる" },
  { value: "light", label: "ライト" },
  { value: "dark", label: "ダーク" },
];

export function ThemeModeDialog({
  isOpen,
  onClose,
}: ThemeModeDialogProps) {
  const { mode, setMode } = useTheme();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  function selectThemeMode(nextMode: ThemeMode) {
    setMode(nextMode);
    onClose();
  }

  return (
    <Dialog
      isOpen={isOpen}
      title="表示テーマ"
      initialFocusRef={closeButtonRef}
      onClose={onClose}
      footer={
        <Button ref={closeButtonRef} variant="secondary" onClick={onClose}>
          閉じる
        </Button>
      }
    >
      <div
        role="radiogroup"
        aria-label="表示テーマ"
        className="space-y-stack-xs"
      >
        {THEME_MODE_ITEMS.map((item) => (
          <Button
            key={item.value}
            role="radio"
            aria-checked={mode === item.value}
            variant="ghost"
            className={[
              "w-full justify-start border",
              mode === item.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-surface hover:bg-surface-muted",
            ].join(" ")}
            onClick={() => selectThemeMode(item.value)}
          >
            <span className="flex-1 text-left">{item.label}</span>
            {mode === item.value && <Check aria-hidden="true" size={18} />}
          </Button>
        ))}
      </div>
    </Dialog>
  );
}
