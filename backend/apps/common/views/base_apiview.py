from rest_framework.views import APIView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect

from apps.common.mixins import (
    LoggingMixin,
    ExceptionMixin,
    ValidationMixin,
)


@method_decorator(csrf_protect, name="dispatch")
class BaseAPIView(
    LoggingMixin,
    ExceptionMixin,
    ValidationMixin,
    APIView,
):
    """
    共通 Base APIView
    """

    pass
