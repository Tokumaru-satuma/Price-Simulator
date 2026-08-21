from .exception_mixin import ExceptionMixin
from .logging_mixin import LoggingMixin
from .permission_mixin import RolePermissionViewSetMixin
from .response_mixin import ResponseMixin
from .validation_mixin import ValidationMixin


class CRUDMixin(
    RolePermissionViewSetMixin,
    LoggingMixin,
    ExceptionMixin,
    ResponseMixin,
    ValidationMixin,
):
    pass
