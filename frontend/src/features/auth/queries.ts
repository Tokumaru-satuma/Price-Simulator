"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/error";

import { getCurrentSession } from "./api";
import { authQueryKeys } from "./query-keys";
import type { AuthSession } from "./types";

const AUTH_SESSION_STALE_TIME = 5 * 60 * 1000;

/** 現在の利用者情報を取得する Query の共通設定。 */
export function currentSessionQueryOptions() {
  return queryOptions<AuthSession, ApiError>({
    queryKey: authQueryKeys.me(),
    queryFn: getCurrentSession,
    retry: false,
    staleTime: AUTH_SESSION_STALE_TIME,
    refetchOnWindowFocus: false,
  });
}

/** 現在ログインしている利用者と権限を取得する。 */
export function useCurrentSession() {
  return useQuery(currentSessionQueryOptions());
}
