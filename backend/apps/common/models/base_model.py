from django.conf import settings
from django.db import models

import uuid

from .managers import ActiveManager


class BaseModel(models.Model):
    """
    全モデル共通の BaseModel
    """

    uuid = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
        help_text="UUID",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="作成日時",
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_%(class)s_set",
        help_text="作成者",
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="更新日時",
    )

    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_%(class)s_set",
        help_text="更新者",
    )

    is_deleted = models.BooleanField(
        default=False,
        help_text="削除フラグ",
    )

    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="削除日時",
    )

    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="deleted_%(class)s_set",
        help_text="削除者",
    )

    objects = ActiveManager()

    all_objects = models.Manager()

    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=["is_deleted"], name="%(class)s_is_deleted_idx"),
            models.Index(fields=["created_at"], name="%(class)s_created_at_idx"),
        ]
