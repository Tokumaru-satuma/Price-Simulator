from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import serializers as s

from apps.common.views import BaseAPIView
from apps.common.responses import success_response
from apps.common.openapi import success_schema, error_schema

from apps.audit.constants import AuditAction
from apps.users.serializers import UserMePasswordUpdateSerializer


@extend_schema_view(
    patch=extend_schema(
        summary="自分のパスワード更新",
        request=UserMePasswordUpdateSerializer,
        responses={
            200: success_schema("UserMePasswordUpdateResponse"),
            400: error_schema(
                "UserMePasswordUpdateValidationError",
                errors_fields={
                    "current_password": s.ListField(),
                    "new_password": s.ListField(),
                    "new_password_confirm": s.ListField(),
                },
            ),
            401: error_schema("UserMePasswordUpdateUnauthorized"),
        },
        tags=["ユーザー"],
    ),
)
class UserMePasswordUpdateAPIView(BaseAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserMePasswordUpdateSerializer

    def patch(self, request):

        serializer = self.serializer_class(
            instance=request.user,
            data=request.data,
            context={"request": request},
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        self.log_action(
            request=request,
            action=AuditAction.PASSWORD_UPDATE,
        )

        return success_response("パスワードを更新しました。")
