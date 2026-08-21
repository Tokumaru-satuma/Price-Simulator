from django.conf import settings
from django.db import models

from apps.common.models import BaseModel


class AuditLog(BaseModel):
    """
    auditLog用Logモデル
    """

    class LEVEL_CHOICES(models.TextChoices):
        INFO = "info", "INFO"
        WARNING = "warning", "WARNING"
        ERROR = "error", "ERROR"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
        help_text="ユーザー",
    )

    username = models.CharField(
        max_length=255, null=True, blank=True, help_text="ユーザー名"
    )

    action = models.CharField(
        max_length=255,
        help_text="実行されたアクション",
    )

    view_name = models.CharField(
        max_length=100,
        blank=True,
        default="",
        verbose_name="View名",
    )

    model_name = models.CharField(
        max_length=255, null=True, blank=True, help_text="対象モデル名"
    )

    object_id = models.CharField(
        max_length=255, null=True, blank=True, help_text="対象オブジェクトID"
    )

    detail = models.TextField(null=True, blank=True, help_text="詳細情報")

    ip_address = models.GenericIPAddressField(
        null=True, blank=True, help_text="IPアドレス"
    )

    user_agent = models.TextField(
        null=True,
        blank=True,
        help_text="ユーザーエージェント",
    )

    level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES.choices,
        default=LEVEL_CHOICES.INFO,
        help_text="ログレベル",
    )

    before_data = models.JSONField(
        null=True,
        blank=True,
        help_text="変更前データ",
    )

    after_data = models.JSONField(
        null=True,
        blank=True,
        help_text="変更後データ",
    )

    changed_fields = models.JSONField(
        default=list,
        blank=True,
        help_text="変更されたフィールドリスト",
    )

    path = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="リクエストパス",
    )
    method = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        help_text="HTTPメソッド",
    )
    query_params = models.JSONField(
        default=dict,
        null=True,
        blank=True,
        help_text="クエリパラメータ",
    )
    traceback = models.TextField(
        null=True,
        blank=True,
        help_text="エラートレースバック",
    )

    class Meta:
        db_table = "audit_logs"

        ordering = ["-created_at"]

        indexes = [
            models.Index(fields=["level"]),
            models.Index(fields=["action"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["user"]),
        ]

        verbose_name = "監視ログ"
        verbose_name_plural = "監視ログ"

    def __str__(self):
        return (
            f"[{self.level}] "
            f"{self.created_at} "
            f"{self.username} "
            f"{self.action}"
        )
