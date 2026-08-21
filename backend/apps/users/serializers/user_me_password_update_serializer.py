from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers


class UserMePasswordUpdateSerializer(serializers.Serializer):
    """ログイン中の利用者が自分のパスワードを変更するための Serializer。"""

    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = self.instance

        if not user.check_password(attrs["current_password"]):
            raise serializers.ValidationError(
                {"current_password": "現在のパスワードが正しくありません。"}
            )

        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "新しいパスワードが一致しません。"}
            )

        try:
            validate_password(attrs["new_password"], user)
        except DjangoValidationError as error:
            raise serializers.ValidationError(
                {"new_password": error.messages}
            ) from error

        return attrs

    def update(self, instance, validated_data):
        instance.set_password(validated_data["new_password"])
        instance.updated_by = self.context["request"].user
        instance.save(update_fields=["password", "updated_by"])

        return instance
