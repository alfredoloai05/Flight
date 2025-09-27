from django.core.management.base import BaseCommand
from destinations.models import Destination

CITIES = [
    ("Quito", "UIO"),
    ("Guayaquil", "GYE"),
    ("Cuenca", "CUE"),
    ("Manta", "MEC"),
    ("Loja", "LOH"),
    ("Baltra (Galápagos)", "GPS"),
    ("San Cristóbal (Galápagos)", "SCY"),
    ("Latacunga", "LTX"),
    ("Tulcán", "TUA"),
    ("Esmeraldas", "ESM"),
    ("Machala", "MCH"),
    ("Tena", "TNW"),
]

class Command(BaseCommand):
    help = "Crea/actualiza destinos base de Ecuador."

    def handle(self, *args, **kwargs):
        created, updated = 0, 0
        
        keep_iatas = {iata for _, iata in CITIES}
        Destination.objects.exclude(iata_code__in=keep_iatas).update(is_active=False)

        for name, iata in CITIES:
            obj, was_created = Destination.objects.update_or_create(
                iata_code=iata,
                defaults={
                    "name": name,
                    "is_active": True,
                },
            )
            created += int(was_created)
            updated += int(not was_created)

        self.stdout.write(self.style.SUCCESS(
            f"Destinos de Ecuador listos. Creados: {created}, Actualizados: {updated}."
        ))
