import django_filters

from apps.audit.models import AuditLog
from apps.common.filters import BaseFilterSet


class AuditLogFilter(BaseFilterSet):
    """
    AuditLog Filter
    """

    action = django_filters.CharFilter(lookup_expr="icontains")
    username = django_filters.CharFilter(lookup_expr="icontains")
    model_name = django_filters.CharFilter(lookup_expr="icontains")
    object_id = django_filters.CharFilter(lookup_expr="icontains")
    level = django_filters.CharFilter(lookup_expr="exact")

    class Meta:
        model = AuditLog
        fields = [
            "action",
            "username",
            "model_name",
            "object_id",
            "level",
            "is_deleted",
            "created_at_from",
            "created_at_to",
        ]
