from django.db import transaction

from rest_framework.decorators import action
from rest_framework import status

from apps.common.responses import success_response, error_response

from apps.audit.constants import AuditAction


class RestoreMixin:

    @action(
        detail=True,
        methods=["post"],
    )
    @transaction.atomic
    def restore(self, request, **kwargs):
        # restore は論理削除済みデータを対象にするため
        # get_object() ではなく get_all_object() を使用

        instance = self.get_all_object()

        if not instance.is_deleted:

            return error_response(
                message="削除されていません。",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        instance.is_deleted = False
        instance.deleted_at = None
        instance.deleted_by = None

        instance.save(
            update_fields=[
                "is_deleted",
                "deleted_at",
                "deleted_by",
            ]
        )

        self.log_action(
            request=request,
            action=AuditAction.RESTORE,
            instance=instance,
        )

        return success_response(
            message="復元しました。",
            status_code=status.HTTP_200_OK,
        )
