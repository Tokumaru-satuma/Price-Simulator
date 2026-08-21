from django.db import transaction

from django.utils import timezone

from rest_framework import status

from apps.common.responses import success_response
from apps.audit.constants import AuditAction


class SoftDeleteMixin:
    def perform_soft_delete(self, request, instance):
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.deleted_by = request.user
        instance.save(update_fields=["is_deleted", "deleted_at", "deleted_by"])

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        self.perform_soft_delete(request, instance)

        self.log_action(
            request=request,
            action=AuditAction.SOFT_DELETE,
            instance=instance,
        )

        return success_response(
            message="削除しました。",
            status_code=status.HTTP_200_OK,
        )
