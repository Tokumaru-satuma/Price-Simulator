from django.db import transaction

from rest_framework.decorators import action
from rest_framework import status

from apps.common.responses import (
    success_response,
    error_response,
)

from apps.audit.constants import AuditAction


class ForceDeleteMixin:

    def perform_force_delete(self, instance):

        instance.delete()

    @action(
        detail=True,
        methods=["delete"],
        url_path="force",
    )
    @transaction.atomic
    def force_destroy(
        self,
        request,
        *args,
        **kwargs,
    ):
        # force delete は論理削除済みデータを対象にするため
        # get_object() ではなく get_all_object() を使用

        instance = self.get_all_object()

        if not instance.is_deleted:

            return error_response(
                message="先に論理削除してください。",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        self.log_action(
            request=request,
            action=AuditAction.FORCE_DELETE,
            instance=instance,
            level="warning",
        )

        self.perform_force_delete(instance)

        return success_response(
            message="完全削除しました。",
            status_code=status.HTTP_200_OK,
        )
