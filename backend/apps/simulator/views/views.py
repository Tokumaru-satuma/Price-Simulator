from decimal import Decimal

from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.decorators import action

from apps.common.responses import success_response
from apps.common.viewsets import BaseModelViewSet, BaseReadOnlyModelViewSet
from apps.simulator.models import (
    CalculationScenario,
    ContactAddress,
    ContactAddressHistory,
    Customer,
    PriceCoefficient,
)
from apps.simulator.serializers import (
    CalculationRequestSerializer,
    CalculationResponseSerializer,
    CalculationScenarioCreateSerializer,
    CalculationScenarioSerializer,
    ContactAddressHistorySerializer,
    ContactAddressSerializer,
    CustomerCreateSerializer,
    CustomerSerializer,
    CustomerUpdateSerializer,
    PriceCoefficientSerializer,
)


@extend_schema_view(
    list=extend_schema(summary="連絡先一覧", tags=["シミュレーション"]),
    retrieve=extend_schema(summary="連絡先詳細", tags=["シミュレーション"]),
    create=extend_schema(summary="連絡先作成", tags=["シミュレーション"]),
    update=extend_schema(summary="連絡先更新", tags=["シミュレーション"]),
    partial_update=extend_schema(summary="連絡先部分更新", tags=["シミュレーション"]),
    destroy=extend_schema(summary="連絡先削除", tags=["シミュレーション"]),
)
class ContactAddressViewSet(BaseModelViewSet):
    queryset = ContactAddress.objects.all()
    serializer_class = ContactAddressSerializer
    search_fields = ["customer_name", "representative_name", "representative_tel"]
    ordering = ["-created_at"]


@extend_schema_view(
    list=extend_schema(summary="連絡先変更履歴一覧", tags=["シミュレーション"]),
    retrieve=extend_schema(summary="連絡先変更履歴詳細", tags=["シミュレーション"]),
)
class ContactAddressHistoryViewSet(BaseReadOnlyModelViewSet):
    queryset = ContactAddressHistory.objects.all()
    serializer_class = ContactAddressHistorySerializer
    search_fields = ["contact_address__customer_name"]
    ordering = ["-created_at"]


@extend_schema_view(
    list=extend_schema(summary="顧客一覧", tags=["シミュレーション"]),
    retrieve=extend_schema(summary="顧客詳細", tags=["シミュレーション"]),
    create=extend_schema(summary="顧客作成", tags=["シミュレーション"]),
    update=extend_schema(summary="顧客更新", tags=["シミュレーション"]),
    partial_update=extend_schema(summary="顧客部分更新", tags=["シミュレーション"]),
    destroy=extend_schema(summary="顧客削除", tags=["シミュレーション"]),
)
class CustomerViewSet(BaseModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    search_fields = ["contact_address__customer_name", "contact_address__representative_name"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "create":
            return CustomerCreateSerializer
        if self.action in ["update", "partial_update"]:
            return CustomerUpdateSerializer
        return super().get_serializer_class()


@extend_schema_view(
    list=extend_schema(summary="係数一覧", tags=["シミュレーション"]),
    retrieve=extend_schema(summary="係数詳細", tags=["シミュレーション"]),
    create=extend_schema(summary="係数作成", tags=["シミュレーション"]),
    update=extend_schema(summary="係数更新", tags=["シミュレーション"]),
    partial_update=extend_schema(summary="係数部分更新", tags=["シミュレーション"]),
    destroy=extend_schema(summary="係数削除", tags=["シミュレーション"]),
)
class PriceCoefficientViewSet(BaseModelViewSet):
    queryset = PriceCoefficient.objects.all()
    serializer_class = PriceCoefficientSerializer
    search_fields = ["name", "target_type"]
    ordering = ["-valid_from"]


@extend_schema_view(
    list=extend_schema(summary="計算条件一覧", tags=["シミュレーション"]),
    retrieve=extend_schema(summary="計算条件詳細", tags=["シミュレーション"]),
    create=extend_schema(summary="計算条件作成", tags=["シミュレーション"]),
    update=extend_schema(summary="計算条件更新", tags=["シミュレーション"]),
    partial_update=extend_schema(summary="計算条件部分更新", tags=["シミュレーション"]),
    destroy=extend_schema(summary="計算条件削除", tags=["シミュレーション"]),
)
class CalculationScenarioViewSet(BaseModelViewSet):
    queryset = CalculationScenario.objects.all()
    serializer_class = CalculationScenarioSerializer
    search_fields = ["note", "organization_type", "broadcast_frequency"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return CalculationScenarioCreateSerializer
        return super().get_serializer_class()

    @extend_schema(
        request=CalculationRequestSerializer,
        responses={200: CalculationResponseSerializer},
        summary="シミュレーション計算",
        tags=["シミュレーション"],
    )
    @action(detail=False, methods=["post"], url_path="calculate")
    def calculate(self, request):
        serializer = CalculationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        customer = Customer.objects.get(id=data["customer_id"], is_deleted=False)
        coefficient = data["coefficient"]

        total_cost = Decimal(str(coefficient.unit_price)) * Decimal(str(data["user_count"]))

        result = {
            "customer": customer.customer_name,
            "calculation_date": data["calculation_date"],
            "organization_type": data["organization_type"],
            "broadcast_frequency": data["broadcast_frequency"],
            "user_count": data["user_count"],
            "total_cost": total_cost,
            "applied_coefficient": {
                "uuid": str(coefficient.uuid),
                "name": coefficient.name,
                "target_type": coefficient.target_type,
                "valid_from": coefficient.valid_from,
                "valid_to": coefficient.valid_to,
                "unit_price": str(coefficient.unit_price),
            },
        }

        return success_response(message="計算しました。", data=result)
