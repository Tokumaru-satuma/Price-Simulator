from django.http import Http404

from rest_framework.exceptions import (
    AuthenticationFailed,
    NotAuthenticated,
    ValidationError,
    PermissionDenied,
    NotFound,
)

from apps.audit.constants import AuditAction

from apps.common.responses import (
    error_response,
)


class ExceptionMixin:
    """
    共通 Exception Mixin
    """

    def handle_exception(self, exc):

        if getattr(self, "swagger_fake_view", False):
            return super().handle_exception(exc)

        request = getattr(self, "request", None)

        # ---------------------------------
        # Validation Error
        # ---------------------------------
        if isinstance(exc, ValidationError):

            if request:
                self.log_action(
                    request=request,
                    action=AuditAction.VALIDATION_ERROR,
                    detail=str(exc.get_full_details()),
                    level="warning",
                )

            return error_response(
                message="validation error",
                errors=exc.get_full_details(),
                status_code=400,
            )

        # ---------------------------------
        # Authentication / Permission
        # ---------------------------------
        elif isinstance(exc, (NotAuthenticated, AuthenticationFailed, PermissionDenied)):

            if request:
                self.log_action(
                    request=request,
                    action=AuditAction.PERMISSION_DENIED,
                    detail=str(exc.detail),
                    level="warning",
                )

        # ---------------------------------
        # Not Found
        # ---------------------------------
        elif isinstance(exc, (NotFound, Http404)):

            if request:
                self.log_action(
                    request=request,
                    action=AuditAction.NOT_FOUND,
                    detail=str(getattr(exc, "detail", exc)),
                    level="warning",
                )

        # ---------------------------------
        # Unexpected Error
        # ---------------------------------
        else:

            if request:
                self.log_action(
                    request=request,
                    action=AuditAction.SERVER_ERROR,
                    detail=str(exc),
                    level="error",
                )

        return super().handle_exception(exc)
