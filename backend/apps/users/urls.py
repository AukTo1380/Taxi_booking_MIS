from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

urlpatterns = [
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("register/", views.UserRegisterAPIView.as_view(), name="register"),
    path(
        "user/password-reset/<email>/",
        views.PasswordRegisterEmailVerifyApiView.as_view(),
        name="password_reset",
    ),
    path(
        "user/password-change/",
        views.PasswordChangeApiView.as_view(),
        name="password_change",
    ),
    path("activate/<uidb64>/<token>/", views.activate_account, name="activate_account"),
]
