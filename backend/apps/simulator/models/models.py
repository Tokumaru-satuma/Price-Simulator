from copy import deepcopy

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from apps.common.models import BaseModel


class ContactAddress(BaseModel):
    customer_name = models.CharField(max_length=255, verbose_name="顧客名")
    representative_name = models.CharField(max_length=255, verbose_name="代表者氏名")
    representative_tel = models.CharField(max_length=50, verbose_name="代表者TEL")
    representative_address = models.TextField(verbose_name="代表住所")

    class Meta:
        verbose_name = "連絡先"
        verbose_name_plural = "連絡先"
        ordering = ["-created_at"]

    def __str__(self):
        return self.customer_name

    def _snapshot(self):
        return {
            "customer_name": self.customer_name,
            "representative_name": self.representative_name,
            "representative_tel": self.representative_tel,
            "representative_address": self.representative_address,
        }

    def save(self, *args, **kwargs):
        is_create = self._state.adding
        previous_snapshot = None

        if not is_create:
            previous = ContactAddress.objects.filter(pk=self.pk).first()
            if previous is not None:
                previous_snapshot = previous._snapshot()

        super().save(*args, **kwargs)

        if is_create or previous_snapshot != self._snapshot():
            ContactAddressHistory.objects.create(
                contact_address=self,
                changed_by=self.updated_by or self.created_by or getattr(self, "changed_by", None),
                previous_snapshot=previous_snapshot or {},
                new_snapshot=self._snapshot(),
            )


class ContactAddressHistory(BaseModel):
    contact_address = models.ForeignKey(
        ContactAddress,
        on_delete=models.CASCADE,
        related_name="history",
        verbose_name="連絡先",
    )
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="contact_address_history",
        verbose_name="変更者",
    )
    previous_snapshot = models.JSONField(default=dict, blank=True, verbose_name="変更前")
    new_snapshot = models.JSONField(default=dict, blank=True, verbose_name="変更後")

    class Meta:
        verbose_name = "連絡先変更履歴"
        verbose_name_plural = "連絡先変更履歴"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.contact_address.customer_name} @ {self.created_at:%Y-%m-%d %H:%M}"


class Customer(BaseModel):
    contact_address = models.ForeignKey(
        ContactAddress,
        on_delete=models.PROTECT,
        related_name="customers",
        verbose_name="連絡先",
    )
    user_count = models.PositiveIntegerField(verbose_name="使用者数")
    organization_type = models.CharField(max_length=50, verbose_name="使用団体区分")
    broadcast_frequency = models.CharField(max_length=50, verbose_name="放送頻度")
    note = models.TextField(blank=True, default="", verbose_name="備考")

    class Meta:
        verbose_name = "顧客"
        verbose_name_plural = "顧客"
        ordering = ["-created_at"]

    @property
    def customer_name(self):
        return self.contact_address.customer_name

    @property
    def representative_name(self):
        return self.contact_address.representative_name

    @property
    def representative_tel(self):
        return self.contact_address.representative_tel

    @property
    def representative_address(self):
        return self.contact_address.representative_address

    def __str__(self):
        return self.customer_name


class PriceCoefficient(BaseModel):
    name = models.CharField(max_length=255, verbose_name="係数名")
    target_type = models.CharField(
        max_length=50,
        default="broadcast",
        verbose_name="対象区分",
    )
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="単価")
    valid_from = models.DateField(verbose_name="適用開始日")
    valid_to = models.DateField(null=True, blank=True, verbose_name="適用終了日")
    is_active = models.BooleanField(default=True, verbose_name="有効")

    class Meta:
        verbose_name = "単価係数"
        verbose_name_plural = "単価係数"
        ordering = ["-valid_from"]

    def clean(self):
        super().clean()
        if self.valid_to and self.valid_to < self.valid_from:
            raise ValidationError("適用終了日は適用開始日以降である必要があります。")

    def __str__(self):
        return f"{self.name} ({self.target_type})"

    @classmethod
    def get_active_for_date(cls, target_type, calculation_date):
        from django.db.models import Q

        return (
            cls.objects.filter(
                target_type=target_type,
                is_deleted=False,
                valid_from__lte=calculation_date,
            )
            .filter(Q(valid_to__isnull=True) | Q(valid_to__gte=calculation_date))
            .order_by("-valid_from")
            .first()
        )


class CalculationScenario(BaseModel):
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="scenarios",
        verbose_name="顧客",
    )
    calculation_date = models.DateField(verbose_name="計算日")
    organization_type = models.CharField(max_length=50, verbose_name="団体区分")
    broadcast_frequency = models.CharField(max_length=50, verbose_name="放送頻度")
    user_count = models.PositiveIntegerField(verbose_name="使用者数")
    note = models.TextField(blank=True, default="", verbose_name="計算メモ")

    class Meta:
        verbose_name = "計算条件"
        verbose_name_plural = "計算条件"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.customer} / {self.calculation_date}"


class CalculationSnapshot(BaseModel):
    scenario = models.ForeignKey(
        CalculationScenario,
        on_delete=models.CASCADE,
        related_name="snapshots",
        verbose_name="計算条件",
    )
    coefficient_snapshot = models.JSONField(verbose_name="適用係数スナップショット")
    result_summary = models.JSONField(verbose_name="計算結果サマリ")
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="総額")

    class Meta:
        verbose_name = "計算スナップショット"
        verbose_name_plural = "計算スナップショット"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Snapshot {self.id}"
