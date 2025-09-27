from django.contrib import admin
from .models import FlightRequest, FlightAvailability

@admin.register(FlightRequest)
class FlightRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "owner", "origin", "destination", "travel_date", "return_date", "status", "created_at")
    list_filter = ("status", "origin", "destination", "travel_date")
    search_fields = ("owner__username", "owner__email", "origin__name", "origin__iata_code",
                     "destination__name", "destination__iata_code")
    autocomplete_fields = ("owner", "origin", "destination")
    date_hierarchy = "travel_date"
    ordering = ("-created_at",)

@admin.register(FlightAvailability)
class FlightAvailabilityAdmin(admin.ModelAdmin):
    list_display = ("date", "origin", "destination", "is_active")
    list_filter = ("is_active", "origin", "destination", "date")
    search_fields = (
        "origin__name",
        "origin__iata_code",
        "destination__name",
        "destination__iata_code",
    )
    autocomplete_fields = ("origin", "destination")
    date_hierarchy = "date"
    ordering = ("date", "origin", "destination")
