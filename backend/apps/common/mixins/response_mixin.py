from rest_framework import status

from apps.common.responses import (
    success_response,
    error_response,
)


class ResponseMixin:

    def success(
        self,
        data=None,
        message="success",
        status_code=status.HTTP_200_OK,
    ):
        return success_response(
            message=message,
            data=data,
            status_code=status_code,
        )

    def error(
        self,
        message="error",
        errors=None,
        status_code=status.HTTP_400_BAD_REQUEST,
    ):
        return error_response(
            message=message,
            errors=errors,
            status_code=status_code,
        )
