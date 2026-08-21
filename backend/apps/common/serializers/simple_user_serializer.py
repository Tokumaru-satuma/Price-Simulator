from rest_framework import serializers

from apps.users.models import User


class SimpleUserSerializer(serializers.ModelSerializer):

    class Meta:

        model = User

        fields = [
            "uuid",
            "username",
            "name",
        ]
