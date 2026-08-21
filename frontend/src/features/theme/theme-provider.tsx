"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  defaultThemeSettings,
  isThemeMode,
  isThemeName,
} from "@/config/theme";

import type {
  ThemeMode,
  ThemeName,
  ThemeSettings,
} from "./types";

const THEME_STORAGE_KEY = "theme-settings";

type ThemeContextValue = ThemeSettings & {
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: ThemeMode) => void;
};

type ThemeProviderProps = {
  children: ReactNode;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readThemeSettings(): ThemeSettings {
  try {
    const storedValue = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (!storedValue) {
      return defaultThemeSettings;
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!parsedValue || typeof parsedValue !== "object") {
      return defaultThemeSettings;
    }

    const { theme, mode } = parsedValue as Record<string, unknown>;

    if (!isThemeName(theme) || !isThemeMode(mode)) {
      return defaultThemeSettings;
    }

    return { theme, mode };
  } catch {
    return defaultThemeSettings;
  }
}

function applyThemeSettings(settings: ThemeSettings): void {
  const root = document.documentElement;

  root.dataset.theme = settings.theme;
  root.dataset.mode = settings.mode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // 初回レンダー時にだけ復元するため、不要な再レンダーを発生させない。
  const [settings, setSettings] = useState<ThemeSettings>(() =>
    readThemeSettings(),
  );

  // 設定の変更時だけ DOM 属性と Local Storage を同期する。
  useEffect(() => {
    applyThemeSettings(settings);
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const value: ThemeContextValue = {
    ...settings,
    setTheme: (theme) => {
      setSettings((currentSettings) => ({
        ...currentSettings,
        theme,
      }));
    },
    setMode: (mode) => {
      setSettings((currentSettings) => ({
        ...currentSettings,
        mode,
      }));
    },
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }

  return context;
}
