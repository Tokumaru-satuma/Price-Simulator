from drf_spectacular.utils import extend_schema, extend_schema_view

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
