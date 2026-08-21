import { ApiError, getApiErrorMessage } from "./error";
import type { ApiEnvelope, ApiFailure, ApiSuccess } from "./types";
import { refreshAccessToken } from "./auth";
import { getCsrfToken } from "./csrf";

type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: HeadersInit;
  retryOn401?: boolean;
};

function isApiFailure<T>(response: ApiEnvelope<T>): response is ApiFailure {
  return !response.success;
}

const AUTH_PATHS_WITHOUT_REFRESH = new Set([
  "/api/accounts/login/",
  "/api/accounts/logout/",
  "/api/accounts/refresh/",
]);

let refreshPromise: Promise<boolean> | null = null;

function refreshAccessTokenOnce(): Promise<boolean> {
  if (refreshPromise === null) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

function canRetryAfterRefresh(path: string): boolean {
  const pathWithoutQuery = path.split(/[?#]/, 1)[0];

  return !AUTH_PATHS_WITHOUT_REFRESH.has(pathWithoutQuery);
}

async function parseResponse<T>(
  response: Response,
): Promise<ApiEnvelope<T> | null> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  return response.json() as Promise<ApiEnvelope<T>>;
}

export async function request<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiSuccess<T>> {
  const { body, headers, retryOn401 = true, ...requestInit } = options;
  const method = (requestInit.method ?? "GET").toUpperCase();
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  let response: Response;

  const csrfToken =
    method === "GET" || method === "HEAD" || method === "OPTIONS"
      ? null
      : await getCsrfToken();

  try {
    response = await fetch(path, {
      ...requestInit,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(body !== undefined && !isFormData
          ? { "Content-Type": "application/json" }
          : {}),
        ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
        ...headers,
      },
      ...(body !== undefined
        ? { body: isFormData ? body : JSON.stringify(body) }
        : {}),
    });
  } catch {
    throw new ApiError({
      status: 0,
      message: "通信に失敗しました。ネットワーク接続を確認してください。",
    });
  }

  const payload = await parseResponse<T>(response);

  if (payload === null) {
    throw new ApiError({
      status: response.status,
      message: "APIからJSON形式のレスポンスを取得できませんでした。",
    });
  }

  if (response.status === 401 && retryOn401 && canRetryAfterRefresh(path)) {
    const refreshed = await refreshAccessTokenOnce();

    if (refreshed) {
      return request<T>(path, {
        ...options,
        retryOn401: false,
      });
    }
  }

  if (!response.ok || isApiFailure(payload)) {
    throw new ApiError({
      status: response.status,
      message: getApiErrorMessage(
        payload.message,
        isApiFailure(payload) ? payload.errors : null,
      ),
      errors: isApiFailure(payload) ? payload.errors : null,
    });
  }

  return payload;
}

export const api = {
  get<T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return request<T>(path, {
      ...options,
      method: "GET",
    });
  },

  post<T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) {
    return request<T>(path, {
      ...options,
      method: "POST",
      body,
    });
  },

  patch<T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) {
    return request<T>(path, {
      ...options,
      method: "PATCH",
      body,
    });
  },

  put<T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) {
    return request<T>(path, {
      ...options,
      method: "PUT",
      body,
    });
  },

  delete<T>(
    path: string,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) {
    return request<T>(path, {
      ...options,
      method: "DELETE",
    });
  },
};
