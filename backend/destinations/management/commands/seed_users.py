import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

def ensure_user(username, email, password, is_staff=False, is_superuser=False, first_name="", last_name=""):
    user, created = User.objects.get_or_create(
        username=username,
        defaults={"email": email, "is_staff": is_staff, "is_superuser": is_superuser, "first_name": first_name, "last_name": last_name},
    )

    user.set_password(password)
    user.is_staff = is_staff
    user.is_superuser = is_superuser
    if first_name:
        user.first_name = first_name
    if last_name:
        user.last_name = last_name
    user.save()
    return created

class Command(BaseCommand):
    help = "Crea/actualiza usuarios base: admin y demo."

    def handle(self, *args, **options):
        admin_user = os.getenv("ADMIN_USER", "admin")
        admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
        admin_pass = os.getenv("ADMIN_PASSWORD", "admin123")

        demo_user = os.getenv("DEMO_USER", "demo")
        demo_email = os.getenv("DEMO_EMAIL", "demo@example.com")
        demo_pass = os.getenv("DEMO_PASSWORD", "demo12345")

        c1 = ensure_user(admin_user, admin_email, admin_pass, True, True, "Admin", "User")
        c2 = ensure_user(demo_user, demo_email, demo_pass, False, False, "Alfredo", "Loaiza")

        self.stdout.write(self.style.SUCCESS(
            f"Usuarios listos. admin({'creado' if c1 else 'actualizado'}), "
            f"demo({'creado' if c2 else 'actualizado'})."
        ))
