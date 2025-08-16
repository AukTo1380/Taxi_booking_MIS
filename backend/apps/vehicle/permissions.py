from rest_framework import permissions


class IsDriver(permissions.BasePermission):
    """
    Allows access only to users with role 'driver'.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "driver"


class IsPassenger(permissions.BasePermission):
    """
    Allows access only to users with role 'passenger'.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "passenger"


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners (passenger or driver) to edit it.
    Assumes the model instance has a `passenger` or `driver` attribute.
    """

    def has_object_permission(self, request, view, obj):
        # Allow read-only requests for any user
        if request.method in permissions.SAFE_METHODS:
            return True

        user = request.user
        if hasattr(obj, "passenger") and obj.passenger == user:
            return True
        if hasattr(obj, "driver") and obj.driver == user:
            return True

        return False
class IsAdmin(permissions.BasePermission):
    """
    Allows access only to users with role 'admin'.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'