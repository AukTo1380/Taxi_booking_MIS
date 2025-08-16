import datetime

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.http import HttpResponse
from django.shortcuts import render
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import CustomRegisterSerializer, UserSerializer
from .utils import send_email_notification

User = get_user_model()
import random


class CustomUserDetailsView(generics.RetrieveUpdateAPIView):
    serializer_class = CustomRegisterSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_queryset(self):
        return get_user_model().objects.none()


# THIS IS THE CORRECT CODE
class UserRegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.none()
    serializer_class = CustomRegisterSerializer
    permission_classes = [AllowAny]

def generate_random_opt_code(length=8):
    otp = "".join([str(random.randint(0, 9)) for _ in range(length)])
    return otp


class PasswordRegisterEmailVerifyApiView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        email = self.kwargs["email"]
        user = User.objects.filter(email=email).first()
        if user:
            # ✅ Correctly encode UUID instead of integer ID
            uuidb64 = urlsafe_base64_encode(force_bytes(str(user.id)))

            refresh = RefreshToken.for_user(user)
            refresh_token = str(refresh.access_token)
            user.refresh_token = refresh_token
            user.otp = generate_random_opt_code()
            user.save()

            link = f"http://localhost:5173/create-new-password?otp={user.otp}&uuidb64={uuidb64}&refresh_token={refresh_token}"
            print("Reset password link =====>", link)

            email_subject = "Reset Email Verification"
            email_template = "email/reset_password_email.html"
            # send_email_notification(
            #     self.request, user, email_subject, email_template, link
            # )

        return user

    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        if user:
            return Response({"message": "Reset password email sent"})
        return Response({"message": "User not found"}, status=404)


class PasswordChangeApiView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        otp = request.data.get("otp")
        uuidb64 = request.data.get("uuidb64")
        password = request.data.get("password")

        if not otp or not uuidb64 or not password:
            return Response(
                {"message": "Missing required fields."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_id = force_str(urlsafe_base64_decode(uuidb64))
            user = User.objects.get(id=user_id, otp=otp)

            user.set_password(password)
            user.otp = ""  # clear OTP
            user.save()

            return Response(
                {"message": "Password changed successfully."},
                status=status.HTTP_201_CREATED,
            )

        except User.DoesNotExist:
            return Response(
                {"message": "User does not exist or invalid OTP."},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            return Response(
                {"message": f"Error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


def activate_account(request, uidb64, token):
    try:
        # Decode the UID
        uid = urlsafe_base64_decode(uidb64).decode()
        user = get_user_model().objects.get(pk=uid)

        # Validate the token
        if default_token_generator.check_token(user, token):
            # Token is valid, activate the user
            user.is_active = True
            user.save()

            return render(
                request,
                "email/activation_success.html",
                {
                    "user": user,
                    "current_year": datetime.datetime.now().year,
                },
            )
        else:
            return HttpResponse("Invalid activation link", status=400)

    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return HttpResponse("Invalid activation link", status=400)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return HttpResponse("Invalid activation link", status=400)
