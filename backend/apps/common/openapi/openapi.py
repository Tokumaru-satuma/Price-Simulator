from drf_spectacular.utils import inline_serializer
from rest_framework import serializers as s
from rest_framework.serializers import Serializer


def success_schema(name: str, data_fields: dict = None):
    """
    success_response の形に合わせたスキーマを生成する

    Args:
        name: スキーマ名（重複不可）
        data_fields: data フィールドの中身（省略時はNullのまま）

    Usage:
        success_schema("LogoutResponse")
        success_schema("MeResponse", {"user": MeSerializer(), "permissions": s.ListField()})
    """

    fields = {
        "success": s.BooleanField(),
        "message": s.CharField(),
        "data": (
            inline_serializer(name=f"{name}Data", fields=data_fields)
            if data_fields
            else s.CharField(allow_null=True)
        ),
        "errors": s.CharField(allow_null=True),
    }

    return inline_serializer(name=name, fields=fields)


def error_schema(name: str, errors_fields: dict = None):
    """
    error_response の形に合わせたスキーマを生成する

    Args:
        name: スキーマ名（重複不可）
        errors_fields: errors フィールドの中身（省略時はDictField）

    Usage:
        error_schema("LoginErrorResponse")
        error_schema("LoginValidationError", {"username": s.ListField(), "password": s.ListField()})
    """

    return inline_serializer(
        name=name,
        fields={
            "success": s.BooleanField(),
            "message": s.CharField(),
            "data": s.CharField(allow_null=True),
            "errors": (
                inline_serializer(name=f"{name}Errors", fields=errors_fields)
                if errors_fields
                else s.DictField(allow_null=True)
            ),
        },
    )


def paginated_schema(name: str, serializer: Serializer):
    """
    CustomPagination の list レスポンス形式に合わせたスキーマを生成する

    レスポンス形式:
    {
        "success": true,
        "message": "",
        "data": {
            "items": [...],
            "pagination": {
                "count": 100,
                "next": "http://...",
                "previous": null,
                "page": 1,
                "page_size": 20
            }
        },
        "errors": null
    }

    Args:
        name: スキーマ名（重複不可）
        serializer: items の中身となる Serializer

    Usage:
        paginated_schema("AuditLogList", AuditLogListSerializer())
    """

    return inline_serializer(
        name=name,
        fields={
            "success": s.BooleanField(),
            "message": s.CharField(),
            "data": inline_serializer(
                name=f"{name}Data",
                fields={
                    "items": serializer,
                    "pagination": inline_serializer(
                        name=f"{name}Pagination",
                        fields={
                            "count": s.IntegerField(),
                            "next": s.CharField(allow_null=True),
                            "previous": s.CharField(allow_null=True),
                            "page": s.IntegerField(),
                            "page_size": s.IntegerField(),
                        },
                    ),
                },
            ),
            "errors": s.CharField(allow_null=True),
        },
    )


def retrieve_schema(name: str, serializer: Serializer):
    """
    retrieve の統一成功レスポンススキーマを生成する

    Args:
        name: スキーマ名（重複不可）
        serializer: レスポンスの Serializer

    Usage:
        retrieve_schema("AuditLogDetail", AuditLogDetailSerializer())
    """

    return serializer_success_schema(name, serializer)


def readonly_responses(
    prefix: str,
    list_serializer: Serializer = None,
    retrieve_serializer: Serializer = None,
) -> dict:
    """
    BaseReadOnlyModelViewSet の共通レスポンススキーマを生成する。

    Args:
        prefix:              スキーマ名のprefix（重複防止のため ViewSet 名を渡す）
        list_serializer:     list の items に使う Serializer クラス
        retrieve_serializer: retrieve の 200 に使う Serializer クラス

    Usage:
        r = readonly_responses(
            prefix="AuditLog",
            list_serializer=AuditLogListSerializer,
            retrieve_serializer=AuditLogDetailSerializer,
        )

        @extend_schema_view(
            list=extend_schema(summary="監査ログ一覧", responses=r["list"], tags=["監査ログ"]),
            retrieve=extend_schema(summary="監査ログ詳細", responses=r["retrieve"], tags=["監査ログ"]),
        )
        class AuditLogViewSet(BaseReadOnlyModelViewSet):
            ...
    """

    def _200(schema):
        return {200: schema} if schema is not None else {}

    return {
        "list": {
            **_200(
                paginated_schema(f"{prefix}List", list_serializer())
                if list_serializer
                else None
            ),
            403: error_schema(f"{prefix}ListForbidden"),
        },
        "retrieve": {
            **_200(
                retrieve_schema(
                    f"{prefix}Retrieve",
                    retrieve_serializer(),
                )
                if retrieve_serializer
                else None
            ),
            403: error_schema(f"{prefix}RetrieveForbidden"),
            404: error_schema(f"{prefix}RetrieveNotFound"),
        },
    }


def base_responses(
    prefix: str,
    list_serializer: Serializer = None,
    retrieve_serializer: Serializer = None,
    create_serializer: Serializer = None,
    update_serializer: Serializer = None,
) -> dict:
    """
    BaseModelViewSet の共通レスポンススキーマを生成する。

    200 レスポンスはシリアライザーを渡した場合のみ設定する。
    省略した場合は drf-spectacular が get_serializer_class() から自動解決する。

    Args:
        prefix:             スキーマ名のprefix（重複防止のため ViewSet 名を渡す）
        list_serializer:    list の items に使う Serializer クラス
        retrieve_serializer: retrieve / force_destroy / restore の 200 に使う Serializer クラス
        create_serializer:  create の 200 に使う Serializer クラス
        update_serializer:  update / partial_update の 200 に使う Serializer クラス

    Usage:
        r = base_responses(
            prefix="User",
            list_serializer=UserListSerializer,
            retrieve_serializer=UserDetailSerializer,
            create_serializer=UserDetailSerializer,
            update_serializer=UserDetailSerializer,
        )

        @extend_schema_view(
            list=extend_schema(summary="ユーザー一覧", responses=r["list"], tags=["ユーザー管理"]),
            retrieve=extend_schema(summary="ユーザー詳細", responses=r["retrieve"], tags=["ユーザー管理"]),
            ...
        )
        class UserViewSet(BaseModelViewSet):
            ...
    """

    def _200(schema):
        return {200: schema} if schema is not None else {}

    return {
        "list": {
            **_200(
                paginated_schema(f"{prefix}List", list_serializer())
                if list_serializer
                else None
            ),
            403: error_schema(f"{prefix}ListForbidden"),
        },
        "retrieve": {
            **_200(
                retrieve_schema(
                    f"{prefix}Retrieve",
                    retrieve_serializer(),
                )
                if retrieve_serializer
                else None
            ),
            403: error_schema(f"{prefix}RetrieveForbidden"),
            404: error_schema(f"{prefix}RetrieveNotFound"),
        },
        "create": {
            **(
                {
                    201: serializer_success_schema(
                        f"{prefix}Create",
                        create_serializer(),
                    )
                }
                if create_serializer
                else {}
            ),
            400: error_schema(f"{prefix}CreateValidationError"),
            403: error_schema(f"{prefix}CreateForbidden"),
        },
        "update": {
            **_200(
                serializer_success_schema(
                    f"{prefix}Update",
                    update_serializer(),
                )
                if update_serializer
                else None
            ),
            400: error_schema(f"{prefix}UpdateValidationError"),
            403: error_schema(f"{prefix}UpdateForbidden"),
            404: error_schema(f"{prefix}UpdateNotFound"),
        },
        "partial_update": {
            **_200(
                serializer_success_schema(
                    f"{prefix}PartialUpdate",
                    update_serializer(),
                )
                if update_serializer
                else None
            ),
            400: error_schema(f"{prefix}PartialUpdateValidationError"),
            403: error_schema(f"{prefix}PartialUpdateForbidden"),
            404: error_schema(f"{prefix}PartialUpdateNotFound"),
        },
        "destroy": {
            200: success_schema(f"{prefix}Destroy"),
            403: error_schema(f"{prefix}DestroyForbidden"),
            404: error_schema(f"{prefix}DestroyNotFound"),
        },
        "force_destroy": {
            200: success_schema(f"{prefix}ForceDestroy"),
            400: error_schema(f"{prefix}ForceDestroyNotDeleted"),
            403: error_schema(f"{prefix}ForceDestroyForbidden"),
            404: error_schema(f"{prefix}ForceDestroyNotFound"),
        },
        "restore": {
            200: success_schema(f"{prefix}Restore"),
            400: error_schema(f"{prefix}RestoreNotDeleted"),
            403: error_schema(f"{prefix}RestoreForbidden"),
            404: error_schema(f"{prefix}RestoreNotFound"),
        },
    }


def serializer_success_schema(
    name: str,
    serializer: Serializer,
):
    """
    success_response の data に Serializer を埋め込む。

    レスポンス形式:
    {
        "success": true,
        "message": "",
        "data": {...serializer...},
        "errors": null
    }

    Usage:
        serializer_success_schema(
            "AuthorizationUpdateResponse",
            AuthorizationDetailSerializer(),
        )
    """

    return inline_serializer(
        name=name,
        fields={
            "success": s.BooleanField(),
            "message": s.CharField(),
            "data": serializer,
            "errors": s.CharField(
                allow_null=True,
                required=False,
            ),
        },
    )
