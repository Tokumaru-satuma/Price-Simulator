from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework import serializers

from apps.common.serializers import BaseCreateUpdateSerializer
from apps.users.models import User


class UserCreateSerializer(BaseCreateUpdateSerializer):
    """
    Users作成用Serializer
    """

    password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    class Meta:

        model = User

        fields = [
            "username",
            "password",
            "email",
            "name",
            "role",
        ]

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error

        return value

    def create(self, validated_data):

        password = validated_data.pop("password")

        role = validated_data.get("role", User.RoleChoices.EDITOR)

        user = User.objects.create_user(
            password=password,
            is_staff=role == User.RoleChoices.ADMIN,
            **validated_data,
        )

        return user
