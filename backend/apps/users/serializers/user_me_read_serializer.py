from rest_framework import serializers
from apps.users.models import User


class UserMeReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "name",
        ]
        read_only_fields = fields
