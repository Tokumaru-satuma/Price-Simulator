from drf_spectacular.utils import extend_schema, extend_schema_view

from apps.audit.filters import AuditLogFilter
from apps.audit.models import AuditLog
from apps.audit.serializers import (
    AuditLogDetailSerializer,
    AuditLogListSerializer,
)

from apps.common.permissions import IsAdmin
from apps.common.viewsets import BaseReadOnlyModelViewSet
from apps.common.openapi import readonly_responses

_r = readonly_responses(
    prefix="AuditLogViewSet",
    list_serializer=AuditLogListSerializer,
    retrieve_serializer=AuditLogDetailSerializer,
)


@extend_schema_view(
    list=extend_schema(summary="監査ログ一覧", responses=_r["list"], tags=["監査ログ"]),
    retrieve=extend_schema(
        summary="監査ログ詳細", responses=_r["retrieve"], tags=["監査ログ"]
    ),
)
class AuditLogViewSet(BaseReadOnlyModelViewSet):
    """
    AuditLog ViewSet
    """

    queryset = AuditLog.objects.all()

    lookup_field = "uuid"

    filterset_class = AuditLogFilter

    search_fields = [
        "username",
        "action",
        "model_name",
        "detail",
    ]

    ordering_fields = [
        "created_at",
        "level",
        "username",
        "action",
    ]

    serializer_class = AuditLogListSerializer

    serializer_action_classes = {
        "retrieve": AuditLogDetailSerializer,
    }

    @property
    def permission_map(self):
        return {
            "list": IsAdmin,
            "retrieve": IsAdmin,
        }

    # -------------------------
    # queryset optimization
    # -------------------------

    select_related_fields = [
        "user",
    ]

    # -------------------------
    # audit recursion防止
    # -------------------------

    enable_list_audit = False

    enable_retrieve_audit = False
