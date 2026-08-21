from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.exceptions import ValidationError

from apps.common.viewsets import BaseModelViewSet
from apps.common.permissions import IsAdmin
from apps.common.openapi import base_responses

from apps.users.models import User

from apps.users.serializers import (
    UserListSerializer,
    UserDetailSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
)

from apps.users.filters import UserFilter

_r = base_responses(
    prefix="UserViewSet",
    list_serializer=UserListSerializer,
    retrieve_serializer=UserDetailSerializer,
    create_serializer=UserDetailSerializer,
    update_serializer=UserDetailSerializer,
)


@extend_schema_view(
    list=extend_schema(
        summary="ユーザー一覧", responses=_r["list"], tags=["ユーザー管理"]
    ),
    retrieve=extend_schema(
        summary="ユーザー詳細", responses=_r["retrieve"], tags=["ユーザー管理"]
    ),
    create=extend_schema(
        summary="ユーザー作成", responses=_r["create"], tags=["ユーザー管理"]
    ),
    update=extend_schema(
        summary="ユーザー更新", responses=_r["update"], tags=["ユーザー管理"]
    ),
    partial_update=extend_schema(
        summary="ユーザー部分更新",
        responses=_r["partial_update"],
        tags=["ユーザー管理"],
    ),
    destroy=extend_schema(
        summary="ユーザー削除", responses=_r["destroy"], tags=["ユーザー管理"]
    ),
    force_destroy=extend_schema(
        summary="ユーザー完全削除", responses=_r["force_destroy"], tags=["ユーザー管理"]
    ),
    restore=extend_schema(
        summary="ユーザー復元", responses=_r["restore"], tags=["ユーザー管理"]
    ),
)
class UserViewSet(BaseModelViewSet):
    queryset = User.objects.all()
    filterset_class = UserFilter

    @property
    def permission_map(self):
        return {
            "list": IsAdmin,
            "retrieve": IsAdmin,
            "create": IsAdmin,
            "update": IsAdmin,
            "partial_update": IsAdmin,
            "destroy": IsAdmin,
            "force_destroy": IsAdmin,
            "restore": IsAdmin,
        }

    lookup_field = "uuid"
    lookup_url_kwarg = "uuid"

    search_fields = [
        "username",
        "email",
        "name",
        "role",
    ]

    ordering_fields = [
        "name",
        "created_at",
        "email",
    ]

    serializer_class = UserListSerializer

    serializer_action_classes = {
        "list": UserListSerializer,
        "retrieve": UserDetailSerializer,
        "create": UserCreateSerializer,
        "update": UserUpdateSerializer,
        "partial_update": UserUpdateSerializer,
    }

    @staticmethod
    def _is_active_admin(user):
        return (
            user.role == User.RoleChoices.ADMIN
            and user.is_staff
            and user.is_active
            and not user.is_deleted
        )

    def _validate_admin_access_change(self, instance, data=None, *, deleting=False):
        data = data or {}
        next_role = data.get("role", instance.role)
        next_is_active = data.get("is_active", instance.is_active)
        loses_admin_access = (
            deleting
            or next_role != User.RoleChoices.ADMIN
            or not next_is_active
        )

        if instance.pk == self.request.user.pk and loses_admin_access:
            raise ValidationError(
                {"user": "自分自身の権限を下げたり、停止・削除したりすることはできません。"}
            )

        if not self._is_active_admin(instance) or not loses_admin_access:
            return

        active_admin_count = User.objects.filter(
            role=User.RoleChoices.ADMIN,
            is_staff=True,
            is_active=True,
        ).count()

        if active_admin_count <= 1:
            raise ValidationError(
                {"user": "最後の有効な管理者を降格・停止・削除することはできません。"}
            )

    def perform_update(self, serializer):
        self._validate_admin_access_change(
            serializer.instance,
            serializer.validated_data,
        )
        super().perform_update(serializer)

    def perform_soft_delete(self, request, instance):
        self._validate_admin_access_change(instance, deleting=True)
        super().perform_soft_delete(request, instance)

        if instance.is_active:
            instance.is_active = False
            instance.save(update_fields=["is_active", "updated_at"])
