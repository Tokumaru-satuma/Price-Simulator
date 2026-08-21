# apps/accounts/views.py

from django.contrib.auth import get_user_model
from django.conf import settings
from django.middleware.csrf import get_token

from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from rest_framework_simplejwt.tokens import RefreshToken

from drf_spectacular.utils import extend_schema

from apps.common.views import BaseAPIView
from apps.common.responses import success_response, error_response
from apps.common.openapi import success_schema, error_schema  # 追加
from apps.audit.constants import AuditAction

from apps.accounts.serializers import (
    LoginSerializer,
    MeSerializer,
)

from apps.common.permissions import get_permissions_from_role

User = get_user_model()


@extend_schema(
    summary="ログイン",
    description="ユーザー名とパスワードで認証し、JWT（access_token / refresh_token）をCookieにセットします。",
    request=LoginSerializer,
    responses={
        200: success_schema("LoginResponse"),
        400: error_schema(
            "LoginValidationError",
            errors_fields={
                "non_field_errors": __import__(
                    "rest_framework"
                ).serializers.ListField(),
            },
        ),
    },
    tags=["認証"],
)
class LoginAPIView(BaseAPIView):
    """
    Login用View
    """

    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = LoginSerializer(data=request.data)

        try:

            serializer.is_valid(raise_exception=True)

        except Exception:

            self.log_action(
                request=request,
                action=AuditAction.LOGIN_FAILED,
                detail=str(serializer.errors),
                level="warning",
            )
            raise

        user = serializer.validated_data["user"]

        # JWT生成
        refresh = RefreshToken.for_user(user)

        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response = success_response(message="ログインしました。")

        self.log_action(
            request=request,
            action=AuditAction.LOGIN,
            detail="Login success",
            user=user,
        )

        # Access Token Cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=settings.JWT_COOKIE_SECURE,
            samesite=settings.JWT_COOKIE_SAMESITE,
        )

        # Refresh Token Cookie
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=settings.JWT_COOKIE_SECURE,
            samesite=settings.JWT_COOKIE_SAMESITE,
        )

        return response


@extend_schema(
    summary="ログアウト",
    description="refresh_tokenをblacklistに登録し、CookieからJWTを削除します。",
    request=None,
    responses={
        200: success_schema("LogoutResponse"),
    },
    tags=["認証"],
)
class LogoutAPIView(BaseAPIView):
    """
    Logout用

    - refresh_token -> blacklist
    - Cookie削除
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):

        refresh_token = request.COOKIES.get("refresh_token")

        logout_success = True

        try:

            if refresh_token:

                token = RefreshToken(refresh_token)

                # blacklist 登録
                token.blacklist()

        except Exception as e:

            logout_success = False

            self.log_action(
                request=request,
                action=AuditAction.LOGOUT_FAILED,
                detail=str(e),
                level="warning",
            )

        response = success_response(message="ログアウトしました。")

        # Cookie削除
        response.delete_cookie("access_token", samesite=settings.JWT_COOKIE_SAMESITE)
        response.delete_cookie("refresh_token", samesite=settings.JWT_COOKIE_SAMESITE)

        if logout_success:
            self.log_action(
                request=request,
                action=AuditAction.LOGOUT,
                detail="Logout success",
            )

        return response


@extend_schema(
    summary="トークンリフレッシュ",
    description="refresh_tokenを検証し、新しいaccess_token / refresh_tokenをCookieにセットします。",
    request=None,
    responses={
        200: success_schema("RefreshResponse"),
        401: error_schema("RefreshErrorResponse"),
    },
    tags=["認証"],
)
class RefreshAPIView(BaseAPIView):
    """
    Token Refresh用
    """

    permission_classes = [AllowAny]

    def post(self, request):

        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:

            self.log_action(
                request=request,
                action=AuditAction.TOKEN_REFRESH_FAILED,
                detail="refresh_token not found",
                level="warning",
            )

            return error_response(
                message="refresh_token not found",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        try:

            # 現在のrefresh token検証
            validated_refresh = RefreshToken(refresh_token)

            user_id = validated_refresh["user_id"]

            user = User.objects.get(id=user_id)

            # 古いrefresh tokenを無効化
            validated_refresh.blacklist()

            # 新しいrefresh token生成
            new_refresh = RefreshToken.for_user(user)

            access_token = str(new_refresh.access_token)
            new_refresh_token = str(new_refresh)

        except Exception as e:

            self.log_action(
                request=request,
                action=AuditAction.TOKEN_REFRESH_FAILED,
                detail=str(e),
                level="warning",
            )
            return error_response(
                message="invalid refresh token",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        response = success_response(message="token refresh success")

        # Access Token更新
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=settings.JWT_COOKIE_SECURE,
            samesite=settings.JWT_COOKIE_SAMESITE,
        )

        # Refresh Token更新
        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token,
            httponly=True,
            secure=settings.JWT_COOKIE_SECURE,
            samesite=settings.JWT_COOKIE_SAMESITE,
        )

        self.log_action(
            request=request,
            action=AuditAction.TOKEN_REFRESH,
            detail="token refreshed",
        )

        return response


@extend_schema(
    summary="ログインユーザー情報取得",
    description="現在認証されているユーザーの情報とロールに応じたパーミッションを返します。",
    request=None,
    responses={
        200: success_schema(
            "MeResponse",
            data_fields={
                "user": MeSerializer(),
                "permissions": __import__("rest_framework").serializers.ListField(),
            },
        ),
        401: error_schema("MeUnauthorizedResponse"),
    },
    tags=["認証"],
)
class MeAPIView(BaseAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        self.log_action(
            request=request,
            action=AuditAction.ME,
            detail="MeAPIView accessed",
        )

        user_data = MeSerializer(user).data

        permissions = get_permissions_from_role(user.role)

        return success_response(
            data={
                "user": user_data,
                "permissions": permissions,
            }
        )


class CsrfTokenAPIView(BaseAPIView):
    """フロントエンドが更新系 API に付与する CSRF トークンを発行する。"""

    permission_classes = [AllowAny]

    def get(self, request):
        return success_response(data={"csrf_token": get_token(request)})
