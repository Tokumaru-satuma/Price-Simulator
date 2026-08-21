from rest_framework import serializers

from apps.common.serializers import BaseDetailSerializer

from apps.users.models import User


class UserDetailSerializer(BaseDetailSerializer):

    role_label = serializers.CharField(
        source="get_role_display",
        read_only=True,
    )

    class Meta:
        model = User
        fields = BaseDetailSerializer.Meta.fields + [
            "username",
            "email",
            "name",
            "role",
            "role_label",
            "is_staff",
            "is_active",
        ]

        read_only_fields = fields
