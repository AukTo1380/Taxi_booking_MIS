from django.contrib.auth import get_user_model
from django_countries.serializer_fields import CountryField
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    gender = serializers.CharField(source="profile.gender")
    phone_number = PhoneNumberField(source="profile.phone_number")
    profile_photo = serializers.ReadOnlyField(source="profile.profile_photo")
    country = CountryField(source="profile.country")
    city = serializers.CharField(source="profile.city")

    profile_photo = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "gender",
            "role",
            "phone_number",
            "profile_photo",
            "country",
            "city",
        ]

    def get_profile_photo(self, obj):
        try:
            if obj.profile.profile_photo and hasattr(obj.profile.profile_photo, "url"):
                return obj.profile.profile_photo.url
        except Exception:
            pass
        return None

    def to_representation(self, instance):
        representation = super(UserSerializer, self).to_representation(instance)
        if instance.is_superuser:
            representation["admin"] = True
        return representation
class CustomRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm Password")

    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
            "password",
            "password2",
        ]
        # Make sure the 'role' field is included as it is required by the frontend
        extra_kwargs = {
            'role': {'required': True}
        }

    def validate(self, attrs):
        """
        Validate that the user doesn't already exist and that passwords match.
        """
        # Check if email exists
        if User.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "A user with this email address already exists."})

        # Check if username exists
        if User.objects.filter(username=attrs["username"]).exists():
            raise serializers.ValidationError({"username": "This username is already taken. Please choose another."})

        # Check if passwords match
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords must match."})

        return attrs

    def create(self, validated_data):
        """
        Create and return a new user instance, given the validated data.
        """
        # Remove the confirmation password as it's not part of the User model
        validated_data.pop('password2')
        
        # Use the custom manager's create_user method which correctly handles password hashing
        user = User.objects.create_user(**validated_data)
        
        return user

class PasswordChangeSerializer(serializers.Serializer):
    otp = serializers.CharField(max_length=10)
    uidb64 = serializers.CharField()
    reset_token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
