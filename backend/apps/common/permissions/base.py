from rest_framework.permissions import BasePermission
from .utils import has_min_role


class RolePermission(BasePermission):
    required_role = None  # "viewer" / "editor" / "admin"

    def has_permission(self, request, view):
        if not self.required_role:
            return True

        return has_min_role(request.user, self.required_role)
