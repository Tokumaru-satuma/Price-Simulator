class AuditAction:

    LIST = "list"

    RETRIEVE = "retrieve"

    CREATE = "create"

    UPDATE = "update"

    PARTIAL_UPDATE = "partial_update"

    SOFT_DELETE = "soft_delete"

    FORCE_DELETE = "force_delete"

    RESTORE = "restore"

    VALIDATION_ERROR = "validation_error"

    PERMISSION_DENIED = "permission_denied"

    NOT_FOUND = "not_found"

    SERVER_ERROR = "server_error"

    LOGIN = "login"

    LOGIN_FAILED = "login_failed"

    LOGOUT = "logout"

    LOGOUT_FAILED = "logout_failed"

    TOKEN_REFRESH = "token_refresh"

    TOKEN_REFRESH_FAILED = "token_refresh_failed"

    ME = "me"

    PASSWORD_UPDATE = "password_update"

    PASSWORD_UPDATE_FAILED = "password_update_failed"

    ADMIN_PASSWORD_UPDATE = "admin_password_update"

    ADMIN_PASSWORD_UPDATE_FAILED = "admin_password_update_failed"
