from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class VehicleConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.vehicle"
    verbose_name = _("Vehicle")
