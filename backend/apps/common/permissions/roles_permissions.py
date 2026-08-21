from .base import RolePermission


class IsViewer(RolePermission):
    required_role = "viewer"


class IsEditor(RolePermission):
    required_role = "editor"


class IsAdmin(RolePermission):
    required_role = "admin"
