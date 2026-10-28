import re

from rest_framework import serializers

from apps.simulator.models import (
    CalculationScenario,
    ContactAddress,
    ContactAddressHistory,
    Customer,
    PriceCoefficient,
)


class ContactAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactAddress
        fields = [
            "uuid",
            "customer_name",
            "representative_name",
            "representative_tel",
            "representative_address",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["uuid", "created_at", "updated_at"]

    def validate_customer_name(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("顧客名は必須です。")
        return value

    def validate_representative_name(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("代表者氏名は必須です。")
        return value

    def validate_representative_tel(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("代表者TELは必須です。")
        if not re.fullmatch(r"[0-9\-()\+]+", value):
            raise serializers.ValidationError("代表者TELは半角数字・-・()・+ のみで入力してください。")
        return value

    def validate_representative_address(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("代表住所は必須です。")
        return value


class ContactAddressHistorySerializer(serializers.ModelSerializer):
    contact_address = ContactAddressSerializer(read_only=True)

    class Meta:
        model = ContactAddressHistory
        fields = [
            "uuid",
            "contact_address",
            "changed_by",
            "previous_snapshot",
            "new_snapshot",
            "created_at",
        ]
        read_only_fields = ["uuid", "created_at"]


class CustomerSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="contact_address.customer_name", read_only=True)
    representative_name = serializers.CharField(
        source="contact_address.representative_name",
        read_only=True,
    )
    representative_tel = serializers.CharField(
        source="contact_address.representative_tel",
        read_only=True,
    )
    representative_address = serializers.CharField(
        source="contact_address.representative_address",
        read_only=True,
    )
    contact_address = ContactAddressSerializer(read_only=True)

    class Meta:
        model = Customer
        fields = [
            "id",
            "uuid",
            "contact_address",
            "customer_name",
            "representative_name",
            "representative_tel",
            "representative_address",
            "user_count",
            "organization_type",
            "broadcast_frequency",
            "note",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "uuid", "created_at", "updated_at"]


class CustomerCreateSerializer(serializers.ModelSerializer):
    contact_address = ContactAddressSerializer()

    class Meta:
        model = Customer
        fields = [
            "uuid",
            "contact_address",
            "user_count",
            "organization_type",
            "broadcast_frequency",
            "note",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["uuid", "created_at", "updated_at"]

    def validate_user_count(self, value):
        if value <= 0:
            raise serializers.ValidationError("使用者数は 1 以上で入力してください。")
        return value

    def validate_organization_type(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("使用団体区分は必須です。")
        return value

    def validate_broadcast_frequency(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("放送頻度は必須です。")
        return value

    def create(self, validated_data):
        contact_address_data = validated_data.pop("contact_address")
        contact_address = ContactAddress.objects.create(**contact_address_data)
        return Customer.objects.create(contact_address=contact_address, **validated_data)


class CustomerUpdateSerializer(serializers.ModelSerializer):
    contact_address = ContactAddressSerializer(required=False)

    class Meta:
        model = Customer
        fields = [
            "uuid",
            "contact_address",
            "user_count",
            "organization_type",
            "broadcast_frequency",
            "note",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["uuid", "created_at", "updated_at"]

    def validate_user_count(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("使用者数は 1 以上で入力してください。")
        return value

    def update(self, instance, validated_data):
        contact_address_data = validated_data.pop("contact_address", None)
        if contact_address_data is not None:
            for field_name, value in contact_address_data.items():
                setattr(instance.contact_address, field_name, value)
            instance.contact_address.save()

        for field_name, value in validated_data.items():
            setattr(instance, field_name, value)

        instance.save()
        return instance


class PriceCoefficientSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceCoefficient
        fields = [
            "id",
            "uuid",
            "name",
            "target_type",
            "unit_price",
            "valid_from",
            "valid_to",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "uuid", "created_at", "updated_at"]


class CalculationScenarioSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)

    class Meta:
        model = CalculationScenario
        fields = [
            "uuid",
            "customer",
            "calculation_date",
            "organization_type",
            "broadcast_frequency",
            "user_count",
            "note",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["uuid", "created_at", "updated_at"]


class CalculationScenarioCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalculationScenario
        fields = [
            "customer",
            "calculation_date",
            "organization_type",
            "broadcast_frequency",
            "user_count",
            "note",
        ]

    def validate_customer(self, value):
        if value is None or value.is_deleted:
            raise serializers.ValidationError("存在しない顧客です。")
        return value

    def validate(self, attrs):
        user_count = attrs.get("user_count")
        if user_count is not None and user_count <= 0:
            raise serializers.ValidationError({"user_count": "使用者数は 1 以上で入力してください。"})

        organization_type = (attrs.get("organization_type") or "").strip()
        broadcast_frequency = (attrs.get("broadcast_frequency") or "").strip()
        if not organization_type:
            raise serializers.ValidationError({"organization_type": "使用団体区分は必須です。"})
        if not broadcast_frequency:
            raise serializers.ValidationError({"broadcast_frequency": "放送頻度は必須です。"})
        return attrs


class CalculationRequestSerializer(serializers.Serializer):
    customer_id = serializers.IntegerField()
    calculation_date = serializers.DateField()
    organization_type = serializers.CharField(max_length=50)
    broadcast_frequency = serializers.CharField(max_length=50)
    user_count = serializers.IntegerField(min_value=1)
    note = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_customer_id(self, value):
        if not Customer.objects.filter(id=value, is_deleted=False).exists():
            raise serializers.ValidationError("存在しない顧客です。")
        return value

    def validate_organization_type(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("使用団体区分は必須です。")
        return value

    def validate_broadcast_frequency(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("放送頻度は必須です。")
        return value

    def validate(self, attrs):
        organization_type = attrs["organization_type"]
        calculation_date = attrs["calculation_date"]

        coefficient = PriceCoefficient.get_active_for_date(
            organization_type,
            calculation_date,
        )
        if coefficient is None:
            raise serializers.ValidationError({
                "calculation_date": "対象日付に適用可能な単価係数がありません。"
            })
        attrs["coefficient"] = coefficient
        return attrs


class CalculationResponseSerializer(serializers.Serializer):
    customer = serializers.CharField()
    calculation_date = serializers.DateField()
    organization_type = serializers.CharField()
    broadcast_frequency = serializers.CharField()
    user_count = serializers.IntegerField()
    total_cost = serializers.DecimalField(max_digits=12, decimal_places=2)
    applied_coefficient = serializers.DictField()
