from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.simulator.views import (
    CalculationScenarioViewSet,
    ContactAddressHistoryViewSet,
    ContactAddressViewSet,
    CustomerViewSet,
    PriceCoefficientViewSet,
)

router = DefaultRouter()
router.register(r"contact-addresses", ContactAddressViewSet, basename="contact-address")
router.register(
    r"contact-address-history",
    ContactAddressHistoryViewSet,
    basename="contact-address-history",
)
router.register(r"customers", CustomerViewSet, basename="customer")
router.register(r"price-coefficients", PriceCoefficientViewSet, basename="price-coefficient")
router.register(r"scenarios", CalculationScenarioViewSet, basename="scenario")

urlpatterns = [
    path("", include(router.urls)),
]
