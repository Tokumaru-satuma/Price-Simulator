from apps.common.permissions import (
    DEFAULT_PERMISSION_MAP_FOR_VIEWSET,
    DEFAULT_PERMISSION_MAP,
    IsAdmin,
)


class PermissionMixin:
    """
    HTTPメソッド毎に権限を分けるMixin
    - GET: 全ユーザー（viewer以上)
    - POST/PUT/PATCH： editor以上
    - その他： 管理者
    """

    @property
    def permission_map(self):
        return DEFAULT_PERMISSION_MAP

    def get_permissions(self):
        permission_class = self.permission_map.get(self.request.method, IsAdmin)
        return [permission_class()]


class RolePermissionViewSetMixin:
    """
    ViewSet用PermissionMixin
    デフォルト
    - list: IsViewer,
    - retrieve: IsViewer,
    - create: IsEditor,
    - update: IsEditor,
    - partial_update: IsEditor,
    - destroy: IsEditor,
    - force_destroy: IsAdmin,
    - restore : IsAdmin,
    上書きは、
    @property
    def permission_map(self):
    """

    @property
    def permission_map(self):
        return DEFAULT_PERMISSION_MAP_FOR_VIEWSET

    def get_permissions(self):
        action = getattr(self, "action", None)

        permission_class = self.permission_map.get(
            action, IsAdmin  # デフォルトは厳しめ
        )

        return [permission_class()]
