from datetime import date
from calendar import monthrange

from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse

from .models import FlightRequest, FlightAvailability
from .serializers import FlightRequestCreateSerializer, FlightRequestListSerializer
from destinations.models import Destination


class IsOperatorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and (request.user.is_staff or request.user.is_superuser))


class FlightRequestViewSet(viewsets.ModelViewSet):
    """
    /api/flight-requests/
      GET:  user -> propias; operator/admin -> todas (?status=PENDING/RESERVED, ?origin=IATA, ?destination=IATA)
      POST: crear (owner = request.user)
      GET detail
      PATCH: operator/admin puede cambiar status
    """
    queryset = FlightRequest.objects.select_related("owner", "origin", "destination")
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ["create"]:
            return FlightRequestCreateSerializer
        return FlightRequestListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        # filtros comunes
        status = self.request.query_params.get("status")
        origin_code = self.request.query_params.get("origin")
        dest_code = self.request.query_params.get("destination")

        if not (user.is_staff or user.is_superuser):
            qs = qs.filter(owner=user)

        if status:
            qs = qs.filter(status=status)

        if origin_code:
            qs = qs.filter(origin__iata_code=origin_code)

        if dest_code:
            qs = qs.filter(destination__iata_code=dest_code)

        return qs

    def perform_create(self, serializer):
        u = self.request.user
        if u.is_staff or u.is_superuser:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Sólo usuarios finales pueden crear solicitudes.")

        # full_clean del modelo hará todas las validaciones (fechas y disponibilidad)
        serializer.save(owner=u)

    def partial_update(self, request, *args, **kwargs):
        # Sólo operador/admin pueden cambiar estado
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({"detail": "No autorizado."}, status=403)
        instance = self.get_object()
        new_status = request.data.get("status")
        if new_status not in dict(FlightRequest.Status.choices):
            return Response({"detail": "Estado inválido."}, status=400)
        instance.status = new_status
        instance.save()
        ser = FlightRequestListSerializer(instance)
        return Response(ser.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def availability_dates(request):
    """
    GET /api/availability/dates/?origin=UIO&destination=GYE&month=2025-09
    Devuelve lista de fechas (YYYY-MM-DD) con disponibilidad activa (ida).
    """
    origin_code = request.GET.get("origin")
    dest_code = request.GET.get("destination")
    month = request.GET.get("month")  # "YYYY-MM"

    if not (origin_code and dest_code and month):
        return JsonResponse({"detail": "origin, destination y month son requeridos"}, status=400)

    try:
        year, m = map(int, month.split("-"))
    except Exception:
        return JsonResponse({"detail": "month inválido (use YYYY-MM)"}, status=400)

    try:
        o = Destination.objects.get(iata_code=origin_code, is_active=True)
        d = Destination.objects.get(iata_code=dest_code, is_active=True)
    except Destination.DoesNotExist:
        return JsonResponse({"detail": "Origen/Destino no válido"}, status=400)

    last = monthrange(year, m)[1]
    start = date(year, m, 1)
    end = date(year, m, last)

    qs = FlightAvailability.objects.filter(
        origin=o, destination=d, is_active=True, date__range=(start, end)
    ).order_by("date")

    dates = [fa.date.isoformat() for fa in qs]
    return JsonResponse({"origin": origin_code, "destination": dest_code, "month": month, "dates": dates})
