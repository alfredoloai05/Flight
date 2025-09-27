from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DestinationListView, DestinationAdminViewSet

router = DefaultRouter()
router.register(r"destinations", DestinationListView, basename="destinations")            # GET list
router.register(r"destinations-admin", DestinationAdminViewSet, basename="destinations-admin")  # CRUD

urlpatterns = [
    path("", include(router.urls)),
]
