import type { UserRole } from "@/features/auth/types";

export type UserStatusFilter = "active" | "inactive" | "deleted";

export type AdminUser = {
  uuid: string;
  created_at: string;
  updated_at: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  role_label: string;
  is_active: boolean;
  is_deleted: boolean;
};

export type UserListFilters = {
  status: UserStatusFilter;
  role: UserRole | "";
  search: string;
};

export type CreateUserPayload = {
  username: string;
  email: string;
  name: string;
  role: UserRole;
  password: string;
};

export type UpdateUserPayload = Omit<CreateUserPayload, "password"> & {
  is_active: boolean;
};
