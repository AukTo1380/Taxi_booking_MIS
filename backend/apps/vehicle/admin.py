from django.contrib import admin

from .models import Location, Route, Trip, Vehicle

admin.site.register(Trip)
admin.site.register(Location)
admin.site.register(Vehicle)
admin.site.register(Route)
