# apps/vehicle/views.py
from datetime import date, timedelta
from django.db.models.functions import TruncDate
from django.db.models import Count 
from rest_framework import generics, permissions, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from .models import Location, Route, Trip, Vehicle, DriverApplication
from .permissions import IsAdmin, IsDriver, IsOwnerOrReadOnly, IsPassenger
from rest_framework.permissions import IsAuthenticated, AllowAny 
from .serializers import (
    AdminDriverApplicationSerializer, AdminTripListSerializer, AdminTripUpdateSerializer,
    DriverApplicationSerializer, DriverTripSerializer, LocationSerializer, RouteSerializer,
    TripRequestSerializer, TripUpdateSerializer, VehicleSerializer, AvailableTripRequestSerializer,DashboardRecentTripSerializer
)
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.response import Response # <-- Add Response
from rest_framework.views import APIView
User = get_user_model()

class VehicleListCreateView(generics.ListCreateAPIView):
    # This view is for Admins to see ALL vehicles.
    # We will rename it to be more specific.
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAdmin] # <-- Change to IsAdmin

    def perform_create(self, serializer):
        # This logic is for an admin creating a vehicle for a driver
        serializer.save()
class DriverVehicleManageView(generics.ListCreateAPIView):
    """
    Allows a logged-in driver to list and create THEIR OWN vehicles.
    """
    serializer_class = VehicleSerializer
    permission_classes = [IsDriver] # <-- Only drivers can access this

    def get_queryset(self):
        """
        This view should only return vehicles owned by the currently logged-in driver.
        """
        return Vehicle.objects.filter(driver=self.request.user)

    def perform_create(self, serializer):
        """
        When a driver creates a vehicle, automatically assign them as the driver.
        """
        serializer.save(driver=self.request.user)

class VehicleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsOwnerOrReadOnly)] 
    lookup_field = "id"


class LocationListCreateView(generics.ListCreateAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


class LocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    lookup_field = "id"


class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer

    def get_permissions(self):
       
        # For 'GET' requests (list/retrieve), allow public access.
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        # For 'POST', 'PUT', 'DELETE' (create/edit), require an Admin.
        else:
            permission_classes = [IsAdmin]
            
        return [permission() for permission in permission_classes]


class TripRequestCreateView(generics.ListCreateAPIView):
    serializer_class = TripRequestSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Trip.objects.filter(passenger=self.request.user)

    def perform_create(self, serializer):
        serializer.save(passenger=self.request.user)


class AdminTripListView(generics.ListAPIView):
    queryset = Trip.objects.select_related('passenger', 'route__pickup', 'route__drop', 'driver').all().order_by('-request_time')
    serializer_class = AdminTripListSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


class DriverTripListView(generics.ListAPIView):
    serializer_class = AvailableTripRequestSerializer 
    permission_classes = [permissions.IsAuthenticated, IsDriver]

    def get_queryset(self):
        """
        This queryset is correct and pre-fetches all necessary data.
        """
        return Trip.objects.filter(
            driver=self.request.user
        ).select_related(
            'passenger', 'route__pickup', 'route__drop'
        ).order_by('-request_time')


class TripDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Trip.objects.all()
    permission_classes = [permissions.IsAuthenticated, (IsOwnerOrReadOnly | IsAdmin)]
    lookup_field = "id"

    def get_serializer_class(self):
        user = self.request.user
        if self.request.method in ['PATCH', 'PUT']:
            if user.role == 'admin':
                return AdminTripUpdateSerializer
            return TripUpdateSerializer
        return TripRequestSerializer


# --- Driver Application Views ---

class DriverApplicationCreateView(generics.CreateAPIView):
    queryset = DriverApplication.objects.all()
    serializer_class = DriverApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsPassenger]

class AdminApplicationListView(generics.ListAPIView):
    queryset = DriverApplication.objects.all().order_by('status', '-created_at')
    serializer_class = AdminDriverApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

# --- THIS IS THE MISSING VIEW CLASS ---
class AdminApplicationDetailView(generics.RetrieveUpdateAPIView):
    """
    For an ADMIN to approve or deny a single application.
    """
    queryset = DriverApplication.objects.all()
    serializer_class = AdminDriverApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    lookup_field = 'id' # Use the application's UUID for the lookup

class AvailableTripRequestListView(generics.ListAPIView):
    """
    Provides a list of unassigned trips on routes the logged-in driver services.
    """
    serializer_class = AvailableTripRequestSerializer # <-- ERROR HAPPENS HERE
    permission_classes = [IsDriver]

    def get_queryset(self):
        driver = self.request.user
        # Get all routes this driver is assigned to
        driver_routes = driver.available_routes.all()
        # Return trips that are 'requested', have no driver, and are on the driver's routes
        return Trip.objects.filter(
            status='requested',
            driver__isnull=True,
            route__in=driver_routes
        ).select_related('route__pickup', 'route__drop', 'passenger').order_by('request_time')


# --- NEW VIEW 2: To securely handle the 'accept' action ---
class AcceptTripView(APIView):
    """
    Allows a driver to accept and assign themselves to a trip.
    """
    permission_classes = [IsDriver]

    def post(self, request, pk, format=None):
        driver = request.user
        try:
            trip = Trip.objects.get(pk=pk)
        except Trip.DoesNotExist:
            return Response({'detail': 'Trip not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Security Checks
        if trip.driver is not None:
            return Response({'detail': 'This trip has already been assigned.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if trip.status != 'requested':
            return Response({'detail': 'This trip is not available for acceptance.'}, status=status.HTTP_400_BAD_REQUEST)

        if driver not in trip.route.drivers.all():
             return Response({'detail': 'You are not authorized to accept trips for this route.'}, status=status.HTTP_403_FORBIDDEN)

        # Assign the trip
        trip.driver = driver
        trip.status = 'in_progress'
        trip.save()

        return Response({'detail': 'Trip accepted successfully.'}, status=status.HTTP_200_OK)
    

class AdminDashboardStatsView(APIView):
   
    permission_classes = [IsAdmin]

    def get(self, request, format=None):
        # KPI Card Stats
        total_users = User.objects.count()
        total_drivers = User.objects.filter(role=User.Role.DRIVER).count()
        total_passengers = User.objects.filter(role=User.Role.PASSENGER).count()
        total_trips = Trip.objects.count()
        pending_applications = DriverApplication.objects.filter(status='pending').count()

        # Recent Trips List (Last 5)
        recent_trips_qs = Trip.objects.select_related(
            'passenger', 'route__pickup', 'route__drop'
        ).order_by('-request_time')[:5]
        recent_trips_serializer = DashboardRecentTripSerializer(recent_trips_qs, many=True)

        # Bar Chart Data (Trips in the last 7 days)
        seven_days_ago = date.today() - timedelta(days=7)
        trips_per_day = (
            Trip.objects.filter(request_time__date__gte=seven_days_ago)
            .annotate(day=TruncDate('request_time')) # This line will now work
            .values('day')
            .annotate(count=Count('id')) 
            .order_by('day')
        )
        chart_data = [{'date': item['day'].strftime('%b %d'), 'trips': item['count']} for item in trips_per_day]

        # Consolidate all data into a single response object
        data = {
            'kpi': {
                'total_users': total_users,
                'total_drivers': total_drivers,
                'total_passengers': total_passengers,
                'total_trips': total_trips,
                'pending_applications': pending_applications,
            },
            'recent_trips': recent_trips_serializer.data,
            'chart_data': chart_data
        }
        return Response(data)