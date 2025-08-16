from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Location, Route, Trip, Vehicle, DriverApplication

User = get_user_model()


class VehicleSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source="driver.get_full_name", read_only=True)
    driver = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.DRIVER),
        required=False,
        allow_null=True
    )
    class Meta:
        model = Vehicle
        fields = [
            "id",
            "pk", 
            "driver",
            "driver_name",
            "model",
            "plate_number",
            "license",
            "type",
        ]
        read_only_fields = ["driver_name"]


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ["id", "name","pk"]


class RouteSerializer(serializers.ModelSerializer):
    pickup = LocationSerializer(read_only=True)
    drop = LocationSerializer(read_only=True)
    pickup_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), source='pickup', write_only=True
    )
    drop_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), source='drop', write_only=True
    )
    class Meta:
        model = Route
        fields = [
            'id',       # The UUID
            'pk',       # The Integer Primary Key
            'pickup',
            'drop',
            'price_af',
            'drivers',
            'vehicles',
            'pickup_id', 
            'drop_id'
        ]
        # Prevent DRF from automatically adding UniqueTogetherValidator
        validators = []

    def validate(self, attrs):
        pickup = attrs.get("pickup")
        drop = attrs.get("drop")

        qs = Route.objects.filter(pickup=pickup, drop=drop)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError(
                {"non_field_errors": ["This route already exists."]}
            )

        return attrs

    def create(self, validated_data):
        drivers = validated_data.pop("drivers", [])
        vehicles = validated_data.pop("vehicles", [])

        route = super().create(validated_data)
        route.drivers.set(drivers)
        route.vehicles.set(vehicles)
        return route

    def update(self, instance, validated_data):
        drivers = validated_data.pop("drivers", None)
        vehicles = validated_data.pop("vehicles", None)

        instance = super().update(instance, validated_data)

        if drivers is not None:
            instance.drivers.set(drivers)

        if vehicles is not None:
            instance.vehicles.set(vehicles)

        return instance


class TripRequestSerializer(serializers.ModelSerializer):
    route_id = serializers.PrimaryKeyRelatedField(
        queryset=Route.objects.all(), source="route", write_only=True
    )
    route = RouteSerializer(read_only=True)

    class Meta:
        model = Trip
        fields = [
            "id",
            "route_id",
            "route",
            "distance_km",
            "fare",
            "status",
            "request_time",
            "start_time",
            "end_time",
            "passenger_count",    # New
            "notes_for_driver",   # New
            "scheduled_for",      # New
        ]
        read_only_fields = [
            "fare", "status", "request_time", "start_time", "end_time", "route",
            "passenger_count", "notes_for_driver", "scheduled_for"
        ]

    def create(self, validated_data):
        route = validated_data.get('route')
        if route:
            validated_data['fare'] = route.price_af
        
        validated_data['passenger'] = self.context['request'].user
        
        return super().create(validated_data)

class DriverTripSerializer(serializers.ModelSerializer):
    passenger_name = serializers.CharField(
        source="passenger.get_full_name", read_only=True
    )
    pickup = serializers.CharField(source="route.pickup.name", read_only=True)
    drop = serializers.CharField(source="route.drop.name", read_only=True)

    class Meta:
        model = Trip
        fields = [
            "id",
            "passenger_name",
            "pickup",
            "drop",
            "fare",
            "route",
            "status",
            "request_time",
            "passenger_count",    # ADDED
            "notes_for_driver",   # ADDED
            "scheduled_for", 
        ]
class TripUpdateSerializer(serializers.ModelSerializer):
   
    class Meta:
        model = Trip
        fields = ['status']

class AdminTripUpdateSerializer(serializers.ModelSerializer):
  
    # The driver field is a write-only field expecting the User's integer PK.
    driver = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.DRIVER),
        required=False, # Make it optional
        allow_null=True
    )

    class Meta:
        model = Trip
        # List only the fields an admin should be able to change.
        fields = ['driver', 'status']


class AdminTripListSerializer(serializers.ModelSerializer):
    """
    A read-only serializer for the admin trip management page.
    It includes nested details for the passenger, driver, and route.
    """
    passenger = serializers.SerializerMethodField()
    route = RouteSerializer(read_only=True)
    driver_name = serializers.CharField(source='driver.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = Trip
        # --- ADD THE NEW FIELDS TO THIS LIST ---
        fields = [
            'id',
            'passenger',
            'driver', 
            'driver_name',
            'route',
            'fare',
            'status',
            'request_time',
            'passenger_count',    # New
            'notes_for_driver',   # New
            'scheduled_for',      # New
        ]

    def get_passenger(self, obj):
        if obj.passenger:
            return obj.passenger.get_full_name
        return "N/A"
    
class DriverApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverApplication
        fields = ['id', 'license_number', 'years_of_experience', 'status']
        read_only_fields = ['status'] # User cannot set the status

    def create(self, validated_data):
        user = self.context['request'].user
        if hasattr(user, 'driver_application'):
            raise serializers.ValidationError("You have already submitted an application.")
        
        application = DriverApplication.objects.create(user=user, **validated_data)
        return application

class AdminDriverApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = DriverApplication
        fields = [
            'id', 'applicant_name', 'license_number', 'years_of_experience',
            'status', 'reviewed_by'
        ]
class AvailableTripRequestSerializer(serializers.ModelSerializer):
    """
    Shows detailed trip info for the "Trip Request Board" for drivers.
    """
    route = RouteSerializer(read_only=True)
    passenger_name = serializers.CharField(source='passenger.get_full_name', read_only=True)

    class Meta:
        model = Trip
        fields = [
            'id', 'pk', 'passenger_name', 'route', 'fare', 'passenger_count',
            'notes_for_driver', 'scheduled_for', 'request_time', 'status'
        ]

class DashboardRecentTripSerializer(serializers.ModelSerializer):
    passenger_name = serializers.CharField(source='passenger.get_full_name', read_only=True)
    route_display = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = ['id', 'passenger_name', 'route_display', 'status', 'request_time']

    def get_route_display(self, obj):
        return f"{obj.route.pickup.name} ➜ {obj.route.drop.name}"