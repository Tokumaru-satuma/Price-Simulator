export type UserRole = "viewer" | "editor" | "admin";

export type AuthenticatedUser = {
  uuid: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  role_label: string;
};

export type AuthPermissions = {
  is_viewer: boolean;
  is_editor: boolean;
  is_admin: boolean;
};

export type AuthSession = {
  user: AuthenticatedUser;
  permissions: AuthPermissions;
};

export type LoginInput = {
  username: string;
  password: string;
};

export type PasswordChangeInput = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};
