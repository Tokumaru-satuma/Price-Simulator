from apps.common.serializers import BaseCreateUpdateSerializer

from apps.users.models import User


class UserUpdateSerializer(BaseCreateUpdateSerializer):
    """
    Users更新用Serializer
    - パスワード変更はUserPasswordUpdateSerializer使用
    """

    class Meta:

        model = User

        fields = [
            "username",
            "email",
            "name",
            "role",
            "is_active",
        ]

    def update(self, instance, validated_data):
        role = validated_data.get("role", instance.role)
        validated_data["is_staff"] = role == User.RoleChoices.ADMIN

        return super().update(instance, validated_data)
