from apps.common.serializers import BaseDetailSerializer

from apps.audit.models import AuditLog


class AuditLogDetailSerializer(BaseDetailSerializer):
    """
    AuditLog Detail Serializer
    """

    class Meta:
        model = AuditLog
        fields = BaseDetailSerializer.Meta.fields + [
            "level",
            "action",
            "view_name",
            "path",
            "username",
            "model_name",
            "object_id",
            "detail",
            "ip_address",
            "user_agent",
            "before_data",
            "after_data",
            "changed_fields",
        ]

        read_only_fields = fields
