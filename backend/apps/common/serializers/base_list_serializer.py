from rest_framework import serializers

from .base_model_serializer import BaseModelSerializer


class BaseListSerializer(BaseModelSerializer):
    """
    共通リストSerializer
    """

    class Meta:
        fields = [
            "uuid",
            "created_at",
            "updated_at",
        ]

        read_only_fields = fields
