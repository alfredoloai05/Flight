from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from .models import FlightRequest

@shared_task
def notify_upcoming_flights():
    target_date = timezone.localdate() + timezone.timedelta(days=2)
    qs = FlightRequest.objects.select_related("owner", "destination").filter(
        travel_date=target_date, status=FlightRequest.Status.PENDING
    )
    for fr in qs:
        if fr.owner.email:
            send_mail(
                subject="Recordatorio de vuelo en 2 días",
                message=f"Hola {fr.owner.username},\n\n"
                        f"Tu vuelo a {fr.destination.name} es el {fr.travel_date}. "
                        "Por favor, revisa el estado de tu reserva.\n\nSaludos.",
                from_email=None,
                recipient_list=[fr.owner.email],
                fail_silently=True,
            )
