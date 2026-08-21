from apps.common.serializers import BaseListSerializer

from apps.audit.models import AuditLog


class AuditLogListSerializer(BaseListSerializer):
    """
    AuditLog List Serializer
    """

    class Meta:

        model = AuditLog
        fields = BaseListSerializer.Meta.fields + [
            "level",
            "action",
            "username",
            "model_name",
            "view_name",
            "path",
            "object_id",
        ]
        read_only_fields = fields
