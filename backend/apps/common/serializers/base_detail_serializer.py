from rest_framework import serializers

from .base_model_serializer import BaseModelSerializer
from .simple_user_serializer import SimpleUserSerializer


class BaseDetailSerializer(BaseModelSerializer):
    """
    共通詳細Serializer
    """

    created_by = SimpleUserSerializer(
        read_only=True,
    )

    updated_by = SimpleUserSerializer(
        read_only=True,
    )

    deleted_by = SimpleUserSerializer(
        read_only=True,
    )

    class Meta:

        fields = [
            "uuid",
            "created_at",
            "created_by",
            "updated_at",
            "updated_by",
            "is_deleted",
            "deleted_at",
            "deleted_by",
        ]

        read_only_fields = fields
