# apps/vehicle/urls.py

from django.urls import include, path
from rest_framework.routers import DefaultRouter

# --- THIS IS THE CORRECTED IMPORT LIST ---
from .views import (
    AdminApplicationDetailView,
    AdminApplicationListView,
    AdminTripListView,
    DriverApplicationCreateView,
    DriverTripListView,
    LocationDetailView,
    LocationListCreateView,
    RouteViewSet,
    TripDetailView,
    TripRequestCreateView,
    VehicleDetailView,
    VehicleListCreateView,
    AvailableTripRequestListView,
    AcceptTripView,   
    DriverVehicleManageView,
    AdminDashboardStatsView
)
# --- END OF FIX ---

router = DefaultRouter()
router.register("vehicle/routes", RouteViewSet, basename="routes")

urlpatterns = [
    path("", include(router.urls)),
    path("vehicles/", VehicleListCreateView.as_view(), name="vehicle-list-create"),
    path("vehicles/<uuid:id>/", VehicleDetailView.as_view(), name="vehicle-detail"),
    path("locations/", LocationListCreateView.as_view(), name="location-list-create"),
    path("locations/<uuid:id>/", LocationDetailView.as_view(), name="location-detail"),
    path("trips/", TripRequestCreateView.as_view(), name="trip-list-create"),
    path("trips/<uuid:id>/", TripDetailView.as_view(), name="trip-detail"),
    path("driver/trips/", DriverTripListView.as_view(), name="driver-trip-list"),
    path("admin/trips/", AdminTripListView.as_view(), name="admin-trip-list"),
    path("driver/apply/", DriverApplicationCreateView.as_view(), name="driver-apply"),
    path("admin/applications/", AdminApplicationListView.as_view(), name="admin-applications-list"),
    path("admin/applications/<uuid:id>/", AdminApplicationDetailView.as_view(), name="admin-applications-detail"),
    path("driver/available-trips/", AvailableTripRequestListView.as_view(), name="driver-available-trips"),
    path("trips/<int:pk>/accept/", AcceptTripView.as_view(), name="driver-accept-trip"),
    path("driver/vehicles/", DriverVehicleManageView.as_view(), name="driver-vehicle-list-create"),
    path("admin/vehicles/", VehicleListCreateView.as_view(), name="admin-vehicle-list-create"),
    path("admin/dashboard-stats/", AdminDashboardStatsView.as_view(), name="admin-dashboard-stats"),
]