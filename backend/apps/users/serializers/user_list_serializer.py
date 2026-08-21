from rest_framework import serializers

from apps.common.serializers import BaseListSerializer

from apps.users.models import User


class UserListSerializer(BaseListSerializer):

    role_label = serializers.CharField(
        source="get_role_display",
        read_only=True,
    )

    class Meta:

        model = User

        fields = BaseListSerializer.Meta.fields + [
            "name",
            "username",
            "email",
            "role",
            "role_label",
            "is_active",
            "is_deleted",
        ]

        read_only_fields = fields
