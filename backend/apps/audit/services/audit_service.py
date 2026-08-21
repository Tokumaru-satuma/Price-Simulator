import logging
import traceback
import uuid
from datetime import date, datetime, time
from decimal import Decimal

from apps.audit.models import AuditLog
from apps.audit.utils import get_model_diff

logger = logging.getLogger(__name__)


class AuditService:
    """
    監査ログサービス
    - API操作ログ
    - DB変更ログ
    - エラーログ
    """

    @staticmethod
    def log_action(
        *,
        request,
        action,
        instance=None,
        detail="",
        level="info",
        before_data=None,
        after_data=None,
        view_name="",
        user=None,
        exception=None,
    ):
        # ---------------------------------
        # user
        # ---------------------------------
        if user is None:
            user = getattr(request, "user", None)

        is_authenticated = bool(user and user.is_authenticated)
        username = user.username if is_authenticated else "anonymous"

        # ---------------------------------
        # request meta
        # ---------------------------------
        meta = getattr(request, "META", {}) or {}

        x_forwarded_for = meta.get("HTTP_X_FORWARDED_FOR")
        ip_address = (
            x_forwarded_for.split(",")[0].strip()
            if x_forwarded_for
            else meta.get("REMOTE_ADDR")
        )

        user_agent = meta.get("HTTP_USER_AGENT", "")

        request_path = getattr(request, "path", "")
        request_method = getattr(request, "method", "")

        query_params_source = getattr(request, "query_params", None)
        if query_params_source is None:
            query_params_source = getattr(request, "GET", {})

        try:
            request_query_params = query_params_source.dict()
        except Exception:
            request_query_params = dict(query_params_source)

        # ---------------------------------
        # model info
        # ---------------------------------
        model_name = instance.__class__.__name__ if instance else None

        object_id = None
        if instance:
            object_id = str(getattr(instance, "uuid", getattr(instance, "pk", None)))

        # ---------------------------------
        # traceback
        # ---------------------------------
        traceback_data = None

        if exception is not None:
            traceback_data = "".join(
                traceback.format_exception(
                    type(exception),
                    exception,
                    exception.__traceback__,
                )
            )

        elif level == "error":
            # fallback（安全側）
            tb = traceback.format_exc()
            traceback_data = tb if tb and "NoneType: None" not in tb else None

        # ---------------------------------
        # diff
        # ---------------------------------
        diff = {}

        if before_data is not None and after_data is not None:
            diff = get_model_diff(before_data, after_data)

        # ---------------------------------
        # log message
        # ---------------------------------
        message = (
            f"[{view_name}] "
            f"action={action} "
            f"user={username} "
            f"ip={ip_address} "
            f"model={model_name} "
            f"object_id={object_id} "
            f"{detail}"
        )

        log_method = getattr(logger, level, logger.info)

        if level == "error":
            logger.error(message, exc_info=True)
        else:
            log_method(message)

        # ---------------------------------
        # DB save
        # ---------------------------------
        AuditLog.objects.create(
            user=user if is_authenticated else None,
            username=username,
            action=action,
            view_name=view_name,
            model_name=model_name,
            object_id=object_id,
            detail=str(detail)[:10000],
            ip_address=ip_address,
            user_agent=user_agent,
            level=level,
            changed_fields=diff.get("changed_fields", []),
            before_data=diff.get("before_data"),
            after_data=diff.get("after_data"),
            path=request_path,
            method=request_method,
            query_params=request_query_params,
            traceback=traceback_data,
        )

    @staticmethod
    def _serialize_value(value):
        """
        JSON非対応の型を安全な型に変換する。
        """
        if isinstance(value, (datetime, date, time)):
            return value.isoformat()
        if isinstance(value, uuid.UUID):
            return str(value)
        if isinstance(value, Decimal):
            return float(value)
        if isinstance(value, (list, tuple)):
            return [AuditService._serialize_value(v) for v in value]
        if isinstance(value, dict):
            return {k: AuditService._serialize_value(v) for k, v in value.items()}
        return value

    @staticmethod
    def get_instance_snapshot(instance):
        """
        モデルインスタンスのフィールド値をスナップショットとして取得する。
        datetime / UUID / Decimal 等の JSON 非対応型は文字列・数値に変換する。
        """
        if instance is None:
            return None

        data = {}

        for field in instance._meta.fields:
            name = field.attname  # ForeignKey は created_by_id のように生IDで取得
            value = getattr(instance, name)
            data[name] = AuditService._serialize_value(value)

        return data
