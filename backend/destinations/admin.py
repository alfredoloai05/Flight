from django.contrib import admin
from .models import Destination

@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ("name", "iata_code", "is_active", "created_at", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("name", "iata_code")
    ordering = ("name",)
