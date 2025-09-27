from django.db import models

class Destination(models.Model):
    name = models.CharField(max_length=120, unique=True)
    iata_code = models.CharField(max_length=3, unique=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        code = f" ({self.iata_code})" if self.iata_code else ""
        return f"{self.name}{code}"
