from django.urls import path

from .views import (
    LoginAPIView,
    LogoutAPIView,
    RefreshAPIView,
    MeAPIView,
    CsrfTokenAPIView,
)

urlpatterns = [
    path("login/", LoginAPIView.as_view(), name="login"),
    path("logout/", LogoutAPIView.as_view(), name="logout"),
    path("refresh/", RefreshAPIView.as_view(), name="refresh"),
    path("me/", MeAPIView.as_view(), name="me"),
    path("csrf/", CsrfTokenAPIView.as_view(), name="csrf-token"),
]
