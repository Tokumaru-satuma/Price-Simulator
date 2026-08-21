from apps.common.serializers import BaseCreateUpdateSerializer

from apps.users.models import User


class UserMeUpdateSerializer(BaseCreateUpdateSerializer):
    """
    自分自身のプロフィール更新用Serializer
    - role変更不可
    - password変更不可
    """

    class Meta:

        model = User

        fields = [
            "username",
            "email",
            "name",
        ]
