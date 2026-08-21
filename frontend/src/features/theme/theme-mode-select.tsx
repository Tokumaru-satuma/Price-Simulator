"use client";

import { useTheme } from "./theme-provider";
import type { ThemeMode } from "./types";

const MODE_OPTIONS: ReadonlyArray<{ value: ThemeMode; label: string }> = [
  { value: "system", label: "システム設定に合わせる" },
  { value: "light", label: "ライト" },
  { value: "dark", label: "ダーク" },
];

type ThemeModeSelectProps = {
  id?: string;
  ariaLabel?: string;
};

/**
 * アプリ共通のテーマ表示モード選択欄。
 * 親画面では label の htmlFor または ariaLabel を指定して利用する。
 */
export function ThemeModeSelect({
  id = "theme-mode",
  ariaLabel,
}: ThemeModeSelectProps) {
  const { mode, setMode } = useTheme();

  return (
    <select
      id={id}
      aria-label={ariaLabel}
      value={mode}
      onChange={(event) => setMode(event.target.value as ThemeMode)}
      className="rounded-control border border-border bg-surface px-control-x py-control-y text-sm text-text shadow-card outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
    >
      {MODE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
