from django.urls import path

from . import views
from .views import (
    AdminUserDetailView,
    AdminUserListView,    
)
urlpatterns = [
    path("all/", views.ProfileListAPIView.as_view(), name="all-profiles"),
    path("me/", views.ProfileDetailAPIView.as_view(), name="my-profile"),
    path("me/update/", views.UpdateProfileAPIView.as_view(), name="update-profile"),
    path("admin/users/", AdminUserListView.as_view(), name="admin-user-list"),
    path("admin/users/<int:pkid>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
]
