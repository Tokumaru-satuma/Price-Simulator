from pathlib import Path
import os
from dotenv import load_dotenv
from datetime import timedelta
from django.core.exceptions import ImproperlyConfigured

import logging
import logging.handlers

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# リポジトリルートを指す
ROOT_DIR = BASE_DIR.parent

LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)

# 自動リロードの監視対象から除外
WATCHMAN_IGNORE_DIRECTORIES = [
    os.path.join(BASE_DIR, "venv"),
    os.path.join(BASE_DIR, "node_modules"),
]

load_dotenv(dotenv_path=BASE_DIR / ".env", override=False)

FIXTURE_DIRS = [
    BASE_DIR / "fixtures",
]

SECRET_KEY = os.getenv("SECRET_KEY")

ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
VALID_ENVIRONMENTS = {"development", "internal", "production"}

if ENVIRONMENT not in VALID_ENVIRONMENTS:
    raise ImproperlyConfigured(
        "ENVIRONMENT は development、internal、production のいずれかを指定してください。"
    )

IS_INTERNAL = ENVIRONMENT == "internal"
IS_PRODUCTION = ENVIRONMENT == "production"
IS_DEPLOYED_ENVIRONMENT = IS_INTERNAL or IS_PRODUCTION

# 社内運用試験と本番では .env に DEBUG=True が残っていても有効化しない。
DEBUG = (
    False
    if IS_DEPLOYED_ENVIRONMENT
    else os.getenv("DEBUG", "False") == "True"
)

if IS_DEPLOYED_ENVIRONMENT and not SECRET_KEY:
    raise ImproperlyConfigured(
        "internal／production 環境では SECRET_KEY の設定が必要です。"
    )


def env_list(name):
    return [value.strip() for value in os.getenv(name, "").split(",") if value.strip()]


def env_bool(name, default=False):
    return os.getenv(name, str(default)).lower() in ("true", "1", "yes", "y")


# production では常に有効。internal では HTTP 運用を許可し、必要時だけ有効化する。
HTTPS_SECURITY_ENABLED = IS_PRODUCTION or env_bool("ENABLE_HTTPS_SECURITY")


CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS")

CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS")

ALLOWED_HOSTS = env_list("ALLOWED_HOSTS")

if IS_DEPLOYED_ENVIRONMENT and (
    not ALLOWED_HOSTS or not CORS_ALLOWED_ORIGINS or not CSRF_TRUSTED_ORIGINS
):
    raise ImproperlyConfigured(
        "internal／production 環境では ALLOWED_HOSTS、CORS_ALLOWED_ORIGINS、"
        "CSRF_TRUSTED_ORIGINS の設定が必要です。"
    )

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "drf_spectacular",
    "rest_framework_simplejwt.token_blacklist",
    "django_filters",
    "apps.common",
    "apps.users",
    "apps.accounts",
    "apps.audit",
    "apps.simulator",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "apps.accounts.authentication.CookieJWTAuthentication",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "EXCEPTION_HANDLER": "apps.common.exceptions.custom_exception_handler",
    "DEFAULT_PAGINATION_CLASS": "apps.common.pagination.pagination.CustomPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
}

WSGI_APPLICATION = "config.wsgi.application"

API_TITLE = os.getenv("API_TITLE", "Django Project API")
API_DESCRIPTION = os.getenv("API_DESCRIPTION", "Django Project Backend API")
API_VERSION = os.getenv("API_VERSION", "1.0.0")

SPECTACULAR_SETTINGS = {
    "TITLE": API_TITLE,
    "DESCRIPTION": API_DESCRIPTION,
    "VERSION": API_VERSION,
    "SERVE_INCLUDE_SCHEMA": DEBUG,
}

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST"),
        "PORT": os.getenv("DB_PORT"),
    }
}

SIMPLE_JWT = {
    # Access Token 有効期限
    "ACCESS_TOKEN_LIFETIME": (timedelta(days=1) if DEBUG else timedelta(minutes=30)),
    # Refresh Token 有効期限
    "REFRESH_TOKEN_LIFETIME": (timedelta(days=30) if DEBUG else timedelta(days=7)),
    # Refresh時に新しいRefresh Token発行
    "ROTATE_REFRESH_TOKENS": True,
    # 古いRefresh Tokenを無効化
    "BLACKLIST_AFTER_ROTATION": True,
    # User ID設定
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# JWT は Cookie で保持するため、本番では HTTPS と CSRF 保護を必須にする。
JWT_COOKIE_SECURE = HTTPS_SECURITY_ENABLED
JWT_COOKIE_SAMESITE = "Lax"

SESSION_COOKIE_SECURE = HTTPS_SECURITY_ENABLED
CSRF_COOKIE_SECURE = HTTPS_SECURITY_ENABLED
SECURE_SSL_REDIRECT = HTTPS_SECURITY_ENABLED
SECURE_HSTS_SECONDS = 31536000 if HTTPS_SECURITY_ENABLED else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = HTTPS_SECURITY_ENABLED
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# TLS 終端をリバースプロキシに置く本番環境で HTTPS を正しく判定する。
if HTTPS_SECURITY_ENABLED:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

AUTH_USER_MODEL = "users.User"

LANGUAGE_CODE = "ja"

TIME_ZONE = "Asia/Tokyo"

USE_I18N = True

USE_TZ = True

STATIC_URL = "static/"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "[{asctime}] [{levelname}] {name} : {message}",
            "style": "{",
        },
    },
    "handlers": {
        # Console
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "standard",
        },
        # Rotating File
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": LOG_DIR / "app.log",
            "maxBytes": 1024 * 1024 * 5,  # 5MB
            "backupCount": 5,
            "formatter": "standard",
            "encoding": "utf-8",
        },
        "auth_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": LOG_DIR / "auth.log",
            "maxBytes": 1024 * 1024 * 5,
            "backupCount": 5,
            "formatter": "standard",
            "encoding": "utf-8",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file"],
            "level": "INFO",
        },
        "apps": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": False,
        },
        "apps.accounts": {
            "handlers": ["console", "auth_file"],
            "level": "INFO",
            "propagate": False,
        },
    },
}
