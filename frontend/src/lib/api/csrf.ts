const CSRF_COOKIE_NAME = "csrftoken";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

let csrfPromise: Promise<string> | null = null;

export async function getCsrfToken(): Promise<string> {
  const existingToken = getCookie(CSRF_COOKIE_NAME);
  if (existingToken) return existingToken;

  if (csrfPromise === null) {
    csrfPromise = fetch("/api/accounts/csrf/", {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("CSRFトークンを取得できませんでした。");

        const token = getCookie(CSRF_COOKIE_NAME);
        if (!token) throw new Error("CSRF Cookieを取得できませんでした。");

        return token;
      })
      .finally(() => {
        csrfPromise = null;
      });
  }

  return csrfPromise;
}
