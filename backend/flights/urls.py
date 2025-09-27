from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FlightRequestViewSet, availability_dates

router = DefaultRouter()
router.register(r"flight-requests", FlightRequestViewSet, basename="flight-requests")

urlpatterns = [
    path("", include(router.urls)),
    path("availability/dates/", availability_dates, name="availability_dates"),
]
