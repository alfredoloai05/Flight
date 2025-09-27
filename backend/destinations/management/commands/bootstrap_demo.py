from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = "Ejecuta el bootstrap completo: usuarios + destinos."

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("-> Creando/actualizando usuarios base..."))
        call_command("seed_users")

        self.stdout.write(self.style.WARNING("-> Sembrando destinos..."))
        call_command("seed_destinations")
        
        self.stdout.write(self.style.WARNING("-> Sembrando disponibilidad"))
        call_command("seed_availability", year=2025, month=9, reset=True)

        self.stdout.write(self.style.SUCCESS("Bootstrap OK ✅"))
