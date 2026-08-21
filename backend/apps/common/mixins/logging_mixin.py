from apps.audit.services import AuditService


class LoggingMixin:
    """
    共通ログMixin
    """

    def log_action(
        self,
        **kwargs,
    ):

        if getattr(self, "swagger_fake_view", False):
            return

        AuditService.log_action(
            view_name=self.__class__.__name__,
            **kwargs,
        )
