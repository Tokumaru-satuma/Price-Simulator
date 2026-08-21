import type { ApiEnvelope } from "./types";
import { getCsrfToken } from "./csrf";

export async function refreshAccessToken(): Promise<boolean> {
  try {
    const csrfToken = await getCsrfToken();
    const response = await fetch("/api/accounts/refresh/", {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "X-CSRFToken": csrfToken,
      },
    });

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      return false;
    }

    const payload = (await response.json()) as ApiEnvelope<null>;

    return response.ok && payload.success;
  } catch {
    return false;
  }
}
