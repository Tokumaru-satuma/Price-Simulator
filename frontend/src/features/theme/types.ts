import type { ThemeMode, ThemeName } from "@/config/theme";

export type { ThemeMode, ThemeName };

export type ThemeSettings = {
  theme: ThemeName;
  mode: ThemeMode;
};
