import datetime
import random

import shortuuid
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import EmailMessage, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


def generate_uuid_otp(length=7):
    uuid_key = shortuuid.uuid()
    unique_key = uuid_key[:6]
    return unique_key


def generate_numeric_otp(length=7):
    """Generate a random numeric OTP of specified length."""
    return "".join([str(random.randint(0, 9)) for _ in range(length)])


def send_verification_email(user):
    """
    Generates a verification link with OTP and sends a verification email to the user.

    Args:
        user (User): The user instance to whom the verification email will be sent.
    """
    otp = generate_numeric_otp()
    uidb64 = urlsafe_base64_encode(str(user.pk).encode()).decode()

    # Generate a token and include it in the reset link sent via email
    refresh = RefreshToken.for_user(user)
    reset_token = str(refresh.access_token)

    # Store the reset_token in the user model for later verification
    user.otp = otp
    user.reset_token = reset_token
    user.save()

    link = f"http://localhost:5173/create-new-password?otp={otp}&uidb64={uidb64}&reset_token={reset_token}"

    merge_data = {
        "link": link,
        "username": user.username,
    }
    subject = "Password Reset Request"
    text_body = render_to_string("email/password_reset.txt", merge_data)
    html_body = render_to_string("email/password_reset.html", merge_data)

    msg = EmailMultiAlternatives(
        subject=subject, from_email=settings.FROM_EMAIL, to=[user.email], body=text_body
    )
    msg.attach_alternative(html_body, "text/html")
    msg.send()
    msg.send()


def send_email_notification(request, user, email_subject, email_template, link=None):
    # Get the current site and protocol (HTTP or HTTPS)
    current_site = get_current_site(request)
    protocol = "https" if request.is_secure() else "http"

    # Generate the uid and token for user activation or password reset
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    # If link is provided, it's for password reset, otherwise for account activation
    if link is None:
        # Generate activation link for new user account activation
        activation_link = (
            f"{protocol}://{current_site.domain}/users/activate/{uid}/{token}/"
        )
        email_message = render_to_string(
            email_template,
            {
                "user": user,
                "domain": current_site.domain,
                "uid": uid,
                "token": token,
                "activation_link": activation_link,  # Pass the full URL here
                "current_year": datetime.datetime.now().year,
            },
        )
    else:
        # Generate reset link for password reset email
        email_message = render_to_string(
            email_template,
            {
                "user": user,
                "domain": current_site.domain,
                "uid": uid,
                "token": token,
                "link": link,  # For password reset link
            },
        )

    # Prepare the email message
    email = EmailMessage(
        subject=email_subject,
        body=email_message,
        to=[user.email],
    )
    email.content_subtype = "html"  # Send as HTML email
    email.send()

    print(f"Sent email to {user.email} with subject: {email_subject}")
