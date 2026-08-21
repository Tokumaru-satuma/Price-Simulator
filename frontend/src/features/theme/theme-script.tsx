import {
  defaultThemeSettings,
  themeModes,
  themeNames,
} from "@/config/theme";

const THEME_SCRIPT = `
(() => {
  const storageKey = "theme-settings";
  const themeNames = ${JSON.stringify(themeNames)};
  const themeModes = ${JSON.stringify(themeModes)};
  let theme = ${JSON.stringify(defaultThemeSettings.theme)};
  let mode = ${JSON.stringify(defaultThemeSettings.mode)};

  try {
    const storedValue = window.localStorage.getItem(storageKey);

    if (storedValue) {
      const parsedValue = JSON.parse(storedValue);

      if (themeNames.includes(parsedValue.theme)) {
        theme = parsedValue.theme;
      }

      if (themeModes.includes(parsedValue.mode)) {
        mode = parsedValue.mode;
      }
    }
  } catch {
    // 保存値が壊れている場合は、既定のテーマ設定で表示する。
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.mode = mode;
})();
`;

/**
 * React の起動前に保存済みテーマを html 要素へ適用し、配色のちらつきを防ぐ。
 */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
