export const themeNames = ["fleet"] as const;
export const themeModes = ["light", "dark", "system"] as const;

export type ThemeName = (typeof themeNames)[number];
export type ThemeMode = (typeof themeModes)[number];

export type DefaultThemeSettings = {
  theme: ThemeName;
  mode: ThemeMode;
};

export function isThemeName(value: unknown): value is ThemeName {
  return typeof value === "string" && themeNames.includes(value as ThemeName);
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === "string" && themeModes.includes(value as ThemeMode);
}

/** .env で指定できる、プロジェクトの初期ブランドテーマ。 */
const configuredTheme = process.env.NEXT_PUBLIC_DEFAULT_THEME;

/** .env で指定できる、初回表示時の表示モード。 */
const configuredMode = process.env.NEXT_PUBLIC_DEFAULT_THEME_MODE;

export const defaultThemeSettings: DefaultThemeSettings = {
  theme: isThemeName(configuredTheme) ? configuredTheme : "fleet",
  mode: isThemeMode(configuredMode) ? configuredMode : "system",
};
