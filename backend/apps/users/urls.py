from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.users.views import (
    UserViewSet,
    UserMeAPIView,
    UserMePasswordUpdateAPIView,
    UserPasswordUpdateAPIView,
)

router = DefaultRouter()
router.register(r"users", UserViewSet)
# → /users/

urlpatterns = [
    # CRUD（admin用）
    path("", include(router.urls)),
    path(
        "<uuid:uuid>/password/",
        UserPasswordUpdateAPIView.as_view(),
        name="user-password",
    ),
    # 自分（Me系）
    path("me/", UserMeAPIView.as_view(), name="user-me"),
    path(
        "me/password/", UserMePasswordUpdateAPIView.as_view(), name="user-me-password"
    ),
]
