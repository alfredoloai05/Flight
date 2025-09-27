from rest_framework import viewsets, permissions, mixins
from rest_framework.response import Response

from .models import Destination
from .serializers import DestinationSerializer

# Cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.core.cache import cache


@method_decorator(cache_page(60 * 10), name="list")  # 10 minutos
class DestinationListView(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    GET /api/destinations/ → lista de destinos activos (para formulario)
    """
    serializer_class = DestinationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Destination.objects.filter(is_active=True).order_by("name")

class DestinationAdminViewSet(viewsets.ModelViewSet):
    """
    CRUD admin: /api/destinations-admin/
    """
    queryset = Destination.objects.all().order_by("name")
    serializer_class = DestinationSerializer
    permission_classes = [permissions.IsAdminUser]
