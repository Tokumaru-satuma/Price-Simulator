from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework import serializers

from apps.common.serializers import BaseCreateUpdateSerializer

from apps.users.models import User


class UserPasswordUpdateSerializer(BaseCreateUpdateSerializer):
    """
    Userパスワード更新用Serializer
    """

    password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    class Meta:

        model = User

        fields = [
            "password",
        ]

    def validate_password(self, value):
        try:
            validate_password(value, self.instance)
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error

        return value

    def update(self, instance, validated_data):

        password = validated_data.pop("password")

        instance.set_password(password)

        user = self.get_request_user()

        instance.updated_by = user

        instance.save(
            update_fields=[
                "password",
                "updated_by",
            ]
        )

        return instance
