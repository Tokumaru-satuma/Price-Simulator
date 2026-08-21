from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import serializers as s

from apps.common.views import BaseAPIView
from apps.common.responses import success_response
from apps.common.openapi import success_schema, error_schema
from apps.audit.constants import AuditAction
from apps.audit.services import AuditService

from apps.users.serializers import (
    UserMeUpdateSerializer,
    UserMeReadSerializer,
)

_USER_ME_FIELDS = {
    "username": s.CharField(),
    "email": s.EmailField(),
    "name": s.CharField(),
}


@extend_schema_view(
    get=extend_schema(
        summary="自分のプロフィール取得",
        request=None,
        responses={
            200: success_schema(
                name="UserMeResponse",
                data_fields=_USER_ME_FIELDS,
            ),
            401: error_schema("UserMeUnauthorized"),
        },
        tags=["ユーザー"],
    ),
    patch=extend_schema(
        summary="自分のプロフィール更新",
        request=UserMeUpdateSerializer,
        responses={
            200: success_schema(
                name="UserMeUpdateResponse",
                data_fields=_USER_ME_FIELDS,
            ),
            401: error_schema("UserMeUpdateUnauthorized"),
        },
        tags=["ユーザー"],
    ),
)
class UserMeAPIView(BaseAPIView):
    """
    ユーザー自身の情報を取得、更新するためのAPIView
    - GET：ユーザー自身の情報を取得
    - PATCH: ユーザー自身の情報を部分的に更新（パスワードは除く）
    - DELETE: 禁止
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserMeReadSerializer(user)

        self.log_action(
            request=request,
            action=AuditAction.RETRIEVE,
        )

        return success_response(
            message="プロフィールを取得しました。",
            data=serializer.data,
        )

    def patch(self, request):

        user = request.user

        before_data = AuditService.get_instance_snapshot(user)

        serializer = UserMeUpdateSerializer(
            user,
            data=request.data,
            partial=True,
            context={"request": request},
        )

        serializer.is_valid(raise_exception=True)

        instance = serializer.save()

        after_data = AuditService.get_instance_snapshot(instance)

        self.log_action(
            request=request,
            action=AuditAction.PARTIAL_UPDATE,
            instance=instance,
            before_data=before_data,
            after_data=after_data,
            detail="self profile updated",
        )

        return success_response(
            message="プロフィールを更新しました。",
            data=UserMeReadSerializer(
                instance,
                context={"request": request},
            ).data,
        )
