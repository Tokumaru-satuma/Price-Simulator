"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { getNextPageParam } from "@/lib/api/pagination";

import { getAdminUsers } from "./api";
import type { UserListFilters } from "./types";

export const adminUserQueryKey = ["app", "admin-user-management"] as const;

export function useAdminUsers(filters: UserListFilters, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: [...adminUserQueryKey, filters],
    queryFn: ({ pageParam }) => getAdminUsers(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam,
    enabled,
  });
}
