from .roles import ROLE_LEVEL


def get_role_level(user):
    if not user or not user.is_authenticated:
        return 0
    return ROLE_LEVEL.get(user.role, 0)


def has_min_role(user, required_role: str) -> bool:
    return get_role_level(user) >= ROLE_LEVEL[required_role]


def get_permissions_from_role(role: str):
    level = ROLE_LEVEL.get(role, 0)

    return {
        "is_viewer": level >= 1,
        "is_editor": level >= 2,
        "is_admin": level >= 3,
    }
