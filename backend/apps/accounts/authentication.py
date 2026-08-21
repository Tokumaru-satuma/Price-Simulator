import logging

from drf_spectacular.extensions import OpenApiAuthenticationExtension
from rest_framework import exceptions
from rest_framework.authentication import CSRFCheck
from rest_framework_simplejwt.authentication import JWTAuthentication

logger = logging.getLogger(__name__)


class CookieJWTAuthentication(JWTAuthentication):

    def enforce_csrf(self, request):
        check = CSRFCheck(lambda request: None)
        check.process_request(request)
        reason = check.process_view(request, None, (), {})
        if reason:
            raise exceptions.PermissionDenied(f"CSRF Failed: {reason}")

    def authenticate(self, request):
        access_token = request.COOKIES.get("access_token")

        if not access_token:
            logger.warning("[CookieJWTAuthentication] access_token not found")
            return None

        validated_token = self.get_validated_token(access_token)

        user = self.get_user(validated_token)

        if request.method not in ("GET", "HEAD", "OPTIONS", "TRACE"):
            self.enforce_csrf(request)

        logger.info(
            f"[CookieJWTAuthentication] authenticated " f"username={user.username}"
        )

        return (user, validated_token)


class CookieJWTAuthenticationScheme(OpenApiAuthenticationExtension):
    target_class = "apps.accounts.authentication.CookieJWTAuthentication"
    name = "CookieJWTAuthentication"

    def get_security_definition(self, auto_schema):
        return {
            "type": "apiKey",
            "in": "cookie",
            "name": "access_token",
        }
