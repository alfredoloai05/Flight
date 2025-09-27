from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from .models import Destination

CACHE_KEYS = [
    # claves que pueda usar cache_page; en desarrollo, limpiar todo es aceptable
    # si prefieres, usa cache.clear() para simplificar
]

@receiver([post_save, post_delete], sender=Destination)
def invalidate_destination_list_cache(sender, **kwargs):
    cache.clear()  # simple y efectivo para el reto
