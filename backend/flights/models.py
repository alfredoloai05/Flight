from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone
from destinations.models import Destination


class FlightAvailability(models.Model):
    """
    Calendario de disponibilidad por ruta y fecha.
    El admin crea filas (origin, destination, date) para habilitar ventas.
    """
    origin = models.ForeignKey(Destination, on_delete=models.PROTECT, related_name="avail_origin_set")
    destination = models.ForeignKey(Destination, on_delete=models.PROTECT, related_name="avail_destination_set")
    date = models.DateField()
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = (("origin", "destination", "date"),)
        ordering = ["date", "origin__name", "destination__name"]

    def __str__(self):
        return f"{self.origin.iata_code}→{self.destination.iata_code} {self.date} ({'ON' if self.is_active else 'OFF'})"


class FlightRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pendiente"
        RESERVED = "RESERVED", "Reservada"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="flight_requests",
    )
    origin = models.ForeignKey(Destination, on_delete=models.PROTECT, related_name="flight_requests_origin")
    destination = models.ForeignKey(Destination, on_delete=models.PROTECT, related_name="flight_requests_destination")

    # ida obligatoria, regreso opcional
    travel_date = models.DateField()
    return_date = models.DateField(blank=True, null=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        today = timezone.localdate()

        if self.origin_id == self.destination_id:
            raise ValidationError({"destination": "El destino debe ser distinto al origen."})

        if self.travel_date <= today:
            raise ValidationError({"travel_date": "La fecha de ida debe ser posterior a hoy."})

        if self.return_date:
            if self.return_date <= self.travel_date:
                raise ValidationError({"return_date": "La fecha de regreso debe ser posterior a la de ida."})

        # Validación contra disponibilidad cargada por admin
        err = {}
        if not FlightAvailability.objects.filter(
            origin=self.origin, destination=self.destination, date=self.travel_date, is_active=True
        ).exists():
            err["travel_date"] = "No hay disponibilidad para la ruta seleccionada en la fecha de ida."

        if self.return_date:
            if not FlightAvailability.objects.filter(
                origin=self.destination, destination=self.origin, date=self.return_date, is_active=True
            ).exists():
                err["return_date"] = "No hay disponibilidad para la ruta seleccionada en la fecha de regreso."
        if err:
            raise ValidationError(err)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        r = f"{self.owner} {self.origin.iata_code}→{self.destination.iata_code} {self.travel_date}"
        if self.return_date:
            r += f" / regreso {self.return_date}"
        return r
