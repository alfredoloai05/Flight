from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from datetime import date, timedelta
import calendar

from destinations.models import Destination
from flights.models import FlightAvailability


class Command(BaseCommand):
    help = "Siembra disponibilidad (FlightAvailability) para un mes/año dado. Sólo rutas nacionales (Ecuador)."

    def add_arguments(self, parser):
        parser.add_argument("--year", type=int, required=True)
        parser.add_argument("--month", type=int, required=True)
        parser.add_argument("--reset", action="store_true", help="Elimina disponibilidad previa del mes antes de sembrar")

    def handle(self, *args, **opts):
        year = opts["year"]
        month = opts["month"]
        reset = opts["reset"]

        # --- Destinos disponibles (por IATA) ---
        iatas = [
            "UIO", "GYE", "CUE", "MEC", "LOH", "GPS", "SCY",
            "LTX", "TUA", "ESM", "MCH", "TNW",
        ]
        dests = {d.iata_code: d for d in Destination.objects.filter(iata_code__in=iatas, is_active=True)}
        missing = [c for c in iatas if c not in dests]
        if missing:
            self.stdout.write(self.style.WARNING(f"Faltan destinos en DB (no activos o no existen): {missing}"))

        # --- Rutas principales (diarias) y secundarias (semanales) ---
        # * Principales: UIO↔GYE, UIO↔CUE, GYE↔CUE (marcamos disponibilidad TODOS los días)
        # * Secundarias: algunas rutas con 1–2 días por semana (p. ej. Lunes y Jueves)
        main_pairs = [
            ("UIO", "GYE"),
            ("UIO", "CUE"),
            ("GYE", "CUE"),
        ]
        # Bidireccionales
        main_pairs += [(b, a) for (a, b) in list(main_pairs)]

        weekly_pairs = [
            ("UIO", "MEC"),
            ("UIO", "LOH"),
            ("GYE", "MEC"),
            ("GYE", "LOH"),
            ("UIO", "GPS"),
            ("UIO", "SCY"),
            ("GYE", "GPS"),
            ("GYE", "SCY"),
            ("UIO", "ESM"),
            ("UIO", "MCH"),
            ("UIO", "TNW"),
            ("UIO", "LTX"),
            ("UIO", "TUA"),
            ("GYE", "ESM"),
            ("GYE", "MCH"),
        ]
        weekly_pairs += [(b, a) for (a, b) in list(weekly_pairs)]

        # Días de la semana donde habrá disponibilidad para las "semanales" (0=Lunes, 3=Jueves)
        weekly_days = {0, 3}

        # --- Rango de fechas del mes ---
        _, last_day = calendar.monthrange(year, month)
        first = date(year, month, 1)
        last = date(year, month, last_day)

        # --- Reset (opcional) ---
        if reset:
            deleted = FlightAvailability.objects.filter(date__range=(first, last)).delete()[0]
            self.stdout.write(self.style.WARNING(f"Eliminadas {deleted} disponibilidades previas de {year}-{month:02d}"))

        created = 0
        updated = 0

        with transaction.atomic():
            current = first
            while current <= last:
                # Principales: disponibilidad diaria
                for (o_code, d_code) in main_pairs:
                    o = dests.get(o_code)
                    d = dests.get(d_code)
                    if not o or not d:
                        continue
                    obj, was_created = FlightAvailability.objects.update_or_create(
                        origin=o,
                        destination=d,
                        date=current,
                        defaults={
                            "is_active": True,
                        },
                    )
                    created += int(was_created)
                    updated += int(not was_created)

                # Secundarias: disponibilidad 1–2 veces por semana (Lun/Jue)
                if current.weekday() in weekly_days:
                    for (o_code, d_code) in weekly_pairs:
                        o = dests.get(o_code)
                        d = dests.get(d_code)
                        if not o or not d:
                            continue
                        obj, was_created = FlightAvailability.objects.update_or_create(
                            origin=o,
                            destination=d,
                            date=current,
                            defaults={
                                "is_active": True,
                            },
                        )
                        created += int(was_created)
                        updated += int(not was_created)

                current += timedelta(days=1)

        self.stdout.write(self.style.SUCCESS(
            f"Disponibilidad lista para {year}-{month:02d}. Creados: {created}, Actualizados: {updated}."
        ))
