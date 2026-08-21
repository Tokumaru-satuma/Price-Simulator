from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import serializers as s
from rest_framework.exceptions import ValidationError

from apps.common.views import BaseAPIView
from apps.common.permissions import IsAdmin
from apps.common.responses import success_response
from apps.common.openapi import success_schema, error_schema
from apps.audit.constants import AuditAction

from apps.users.serializers import UserPasswordUpdateSerializer

User = get_user_model()


@extend_schema_view(
    patch=extend_schema(
        summary="ユーザーパスワード更新（管理者用）",
        request=UserPasswordUpdateSerializer,
        responses={
            200: success_schema("UserPasswordUpdateResponse"),
            400: error_schema(
                "UserPasswordUpdateValidationError",
                errors_fields={"password": s.ListField()},
            ),
            403: error_schema("UserPasswordUpdateForbidden"),
            404: error_schema("UserPasswordUpdateNotFound"),
        },
        tags=["ユーザー管理"],
    ),
)
class UserPasswordUpdateAPIView(BaseAPIView):
    permission_classes = [IsAdmin]
    serializer_class = UserPasswordUpdateSerializer

    def patch(self, request, uuid):

        user = get_object_or_404(User, uuid=uuid)

        if user.pk == request.user.pk:
            raise ValidationError(
                {"user": "自分自身のパスワードは個人設定から変更してください。"}
            )

        serializer = self.serializer_class(
            instance=user,
            data=request.data,
            partial=True,
            context={"request": request},
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        self.log_action(
            request=request,
            action=AuditAction.ADMIN_PASSWORD_UPDATE,
            instance=user,
        )

        return success_response("パスワードを更新しました。")
