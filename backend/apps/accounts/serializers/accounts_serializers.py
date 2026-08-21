from django.contrib.auth import authenticate
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    """
    Login用Serializer
    """

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        user = authenticate(
            username=username,
            password=password,
        )

        if not user:
            raise serializers.ValidationError(
                "ログインIDまたはパスワードが間違えています。"
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "ログインIDまたはパスワードが間違えています"
            )

        attrs["user"] = user

        return attrs


class MeSerializer(serializers.ModelSerializer):

    role_label = serializers.CharField(
        source="get_role_display",
        read_only=True,
    )

    class Meta:
        model = User
        fields = [
            "uuid",
            "username",
            "name",
            "email",
            "role",
            "role_label",
        ]
