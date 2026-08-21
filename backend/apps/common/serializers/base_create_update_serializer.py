from rest_framework import serializers

from .base_model_serializer import BaseModelSerializer


class BaseCreateUpdateSerializer(BaseModelSerializer):
    """
    共通作成・更新Serializer
    """

    class Meta:

        read_only_fields = [
            "id",
            "uuid",
        ]
