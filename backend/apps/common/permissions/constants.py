from apps.common.permissions.roles_permissions import IsAdmin, IsEditor, IsViewer

DEFAULT_PERMISSION_MAP = {
    "GET": IsViewer,
    "POST": IsEditor,
    "PUT": IsEditor,
    "PATCH": IsEditor,
    "DELETE": IsAdmin,
}

DEFAULT_PERMISSION_MAP_FOR_VIEWSET = {
    "list": IsViewer,
    "retrieve": IsViewer,
    "create": IsEditor,
    "update": IsEditor,
    "partial_update": IsEditor,
    # soft delete
    "destroy": IsEditor,
    # physical delete
    "force_destroy": IsAdmin,
    # restore
    "restore": IsAdmin,
}
