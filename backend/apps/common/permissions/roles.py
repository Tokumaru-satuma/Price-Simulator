class Role:
    VIEWER = "viewer"
    EDITOR = "editor"
    ADMIN = "admin"


ROLE_LEVEL = {
    Role.VIEWER: 1,
    Role.EDITOR: 2,
    Role.ADMIN: 3,
}
