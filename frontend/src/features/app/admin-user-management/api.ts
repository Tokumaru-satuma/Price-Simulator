import { api } from "@/lib/api/client";
import type { PaginatedData } from "@/lib/api/types";

import type {
  AdminUser,
  CreateUserPayload,
  UpdateUserPayload,
  UserListFilters,
} from "./types";

export async function getAdminUsers(
  filters: UserListFilters,
  page: number,
): Promise<PaginatedData<AdminUser>> {
  const params = new URLSearchParams({ page: String(page), page_size: "20" });
  if (filters.status === "deleted") params.set("only_deleted", "true");
  else params.set("is_active", String(filters.status === "active"));
  if (filters.role) params.set("role", filters.role);
  if (filters.search.trim()) params.set("search", filters.search.trim());

  const response = await api.get<PaginatedData<AdminUser>>(
    `/api/users/users/?${params.toString()}`,
  );
  return response.data;
}

export async function createAdminUser(payload: CreateUserPayload): Promise<AdminUser> {
  const response = await api.post<AdminUser>("/api/users/users/", payload);
  return response.data;
}

export async function updateAdminUser(
  uuid: string,
  payload: Partial<UpdateUserPayload>,
): Promise<AdminUser> {
  const response = await api.patch<AdminUser>(`/api/users/users/${uuid}/`, payload);
  return response.data;
}

export async function deleteAdminUser(uuid: string): Promise<void> {
  await api.delete(`/api/users/users/${uuid}/`);
}

export async function restoreAdminUser(uuid: string): Promise<void> {
  await api.post(`/api/users/users/${uuid}/restore/`);
}

export async function resetAdminUserPassword(uuid: string, password: string): Promise<void> {
  await api.patch(`/api/users/${uuid}/password/`, { password });
}
