from datetime import datetime
from uuid import UUID

from django.db import models

# -----------------------------------
# 完全除外フィールド
# -----------------------------------

AUDIT_EXCLUDE_FIELDS = [
    "updated_at",
]


# -----------------------------------
# 部分一致除外キーワード
# -----------------------------------

AUDIT_EXCLUDE_KEYWORDS = [
    "password",
    "token",
    "secret",
    "key",
    "file",
    "image",
    "thumbnail",
    "binary",
]


def should_exclude_field(
    field_name,
    exclude_fields=None,
):
    """
    audit対象外判定
    """

    exclude_fields = exclude_fields or []

    # 完全一致
    if field_name in AUDIT_EXCLUDE_FIELDS:
        return True

    if field_name in exclude_fields:
        return True

    # 部分一致
    field_name_lower = field_name.lower()

    return any(keyword in field_name_lower for keyword in AUDIT_EXCLUDE_KEYWORDS)


def serialize_audit_value(value):
    """
    Audit保存用 serialize
    """

    # ForeignKey
    if isinstance(value, models.Model):

        # uuid 優先
        if hasattr(value, "uuid"):
            return str(value.uuid)

        return str(value.pk)

    # datetime
    if isinstance(value, datetime):
        return value.isoformat()

    # UUID
    if isinstance(value, UUID):
        return str(value)

    return value


def model_to_dict_for_audit(
    instance,
    fields=None,
    exclude_fields=None,
):
    """
    モデル -> audit用dict変換
    """

    data = {}

    # Model側の定義優先
    model_audit_fields = getattr(
        instance,
        "AUDIT_FIELDS",
        None,
    )

    for field in instance._meta.fields:

        field_name = field.name

        # -----------------------------
        # include fields
        # -----------------------------
        if model_audit_fields:

            if field_name not in model_audit_fields:
                continue

        # -----------------------------
        # fields 指定
        # -----------------------------
        elif fields:

            if field_name not in fields:
                continue

        # -----------------------------
        # exclude 判定
        # -----------------------------
        if should_exclude_field(
            field_name,
            exclude_fields,
        ):
            continue

        value = getattr(
            instance,
            field_name,
        )

        data[field_name] = serialize_audit_value(value)

    return data


def get_model_diff(
    before_data,
    after_data,
    fields=None,
):
    """
    before / after 差分取得
    """

    changed_fields = []

    before_diff = {}

    after_diff = {}

    for field in before_data:

        # fields制限
        if fields and field not in fields:
            continue

        before_value = before_data.get(field)

        after_value = after_data.get(field)

        if before_value != after_value:

            changed_fields.append(field)

            before_diff[field] = before_value

            after_diff[field] = after_value

    return {
        "changed_fields": changed_fields,
        "before_data": before_diff,
        "after_data": after_diff,
    }
