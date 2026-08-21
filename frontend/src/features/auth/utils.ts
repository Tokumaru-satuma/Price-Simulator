// カレンダー画面を実装するまで、ログイン直後はルートの仮画面を表示する。
const DEFAULT_SIGNED_IN_PATH = "/";

/** ログイン後の遷移先を、アプリ内の相対パスだけに制限する。 */
export function getSafeNextPath(nextPath: string | undefined): string {
  if (!nextPath || !nextPath.startsWith("/")) {
    return DEFAULT_SIGNED_IN_PATH;
  }

  // `//example.com` や `/\example.com` のような外部 URL 解釈を防ぐ。
  if (nextPath.startsWith("//") || nextPath.includes("\\")) {
    return DEFAULT_SIGNED_IN_PATH;
  }

  return nextPath;
}
