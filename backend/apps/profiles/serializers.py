from django_countries.serializer_fields import CountryField
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile
User = get_user_model() 

class ProfileSerializers(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username")
    first_name = serializers.CharField(source="user.first_name")
    last_name = serializers.CharField(source="user.last_name")
    email = serializers.EmailField(source='user.email')
    role = serializers.CharField(source='user.role', read_only=True)
    user_pkid = serializers.IntegerField(source='user.pk', read_only=True)
    full_name = serializers.SerializerMethodField(read_only=True)
    profile_photo = serializers.SerializerMethodField()
    country = CountryField(name_only=True)

    class Meta:
        model = Profile
        fields = [
            "id",
            "user_pkid",
            "username",
            "first_name",
            "last_name",
            "role",
            "full_name",
            "email",
            "profile_photo",
            "country",
            "address",
            "gender",
            "city",
            "about_me",
            "phone_number",
        ]

    def get_full_name(self, obj):
        first_name = obj.user.first_name.title()
        last_name = obj.user.last_name.title()
        return f"{first_name} {last_name}"

    def get_profile_photo(self, obj):
        return obj.profile_photo.url

    def update(self, instance, validated_data):
        # Extract nested user data
        user_data = validated_data.pop("user", {})

        # Update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update user fields
        user = instance.user
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()

        return instance


class UpdateProfileSerializer(serializers.ModelSerializer):
    country = CountryField(name_only=True, read_only=True)

    class Meta:
        model = Profile
        fields = [
            "phone_number",
            "profile_photo",
            "about_me",
            "gender",
            "country",
            "city",
        ]

    def update(self, instance, validated_data):
        # Update each field manually
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class AdminUserListSerializer(serializers.ModelSerializer):
    """
    Serializer for the admin user management page (read-only list).
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = [
            'pkid',         # The integer primary key
            'id',           # The UUID
            'username',
            'email',
            'full_name',
            'role',
            'is_active',
            'date_joined'
        ]
class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for an Admin to update a user's role or active status.
    """
    class Meta:
        model = User
        # Define the specific fields an admin can modify.
        fields = ['role', 'is_active']