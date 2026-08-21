from rest_framework import serializers


class BaseModelSerializer(serializers.ModelSerializer):
    """
    共通Base Serializer
    """

    id = serializers.IntegerField(
        read_only=True,
    )

    uuid = serializers.UUIDField(
        read_only=True,
    )

    created_at = serializers.DateTimeField(
        format="%Y-%m-%d %H:%M:%S",
        read_only=True,
    )

    updated_at = serializers.DateTimeField(
        format="%Y-%m-%d %H:%M:%S",
        read_only=True,
    )

    is_deleted = serializers.BooleanField(
        read_only=True,
    )

    deleted_at = serializers.DateTimeField(
        format="%Y-%m-%d %H:%M:%S",
        read_only=True,
    )

    def get_request_user(self):
        request = self.context.get("request")
        user = (
            request.user
            if request and getattr(request.user, "is_authenticated", False)
            else None
        )
        return user

    def create(self, validated_data):

        user = self.get_request_user()

        validated_data["created_by"] = user
        validated_data["updated_by"] = user

        return super().create(validated_data)

    def update(self, instance, validated_data):

        user = self.get_request_user()

        validated_data["updated_by"] = user

        return super().update(
            instance,
            validated_data,
        )
