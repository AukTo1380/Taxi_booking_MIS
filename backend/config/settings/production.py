from os import getenv, path

from dotenv import load_dotenv  # type: ignore

from .base import *  # noqa
from .base import ROOT_DIR

# Load environment variables from .env file (optional in production, but can still be used)
prod_env_file = path.join(ROOT_DIR, ".env", ".env.production")
if path.isfile(prod_env_file):
    load_dotenv(prod_env_file)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# Set your production domain
SITE_NAME = getenv("SITE_NAME", "chiqfrip")
ALLOWED_HOSTS = ["chiqfrip.hzcitycenter.com"]

# Required secret key for Django
SECRET_KEY = getenv("DJANGO_SECRET_KEY")

# Custom admin URL for added security
ADMIN_URL = getenv("ADMIN_URL", "secureadmin/")

# Email settings
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = getenv("EMAIL_HOST")
EMAIL_PORT = int(getenv("EMAIL_PORT", 587))
EMAIL_USE_TLS = True  # Assumes you're using TLS
EMAIL_HOST_USER = getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = getenv("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = getenv("DEFAULT_FROM_EMAIL", "webmaster@chiqfrip.hzcitycenter.com")

# Maximum file upload size (1MB)
MAX_UPLOAD_SIZE = 1 * 1024 * 1024

# Trusted origins for CSRF protection
CSRF_TRUSTED_ORIGINS = [
    "https://chiqfrip.hzcitycenter.com",
]

# Logging config
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django.security": {
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": False,
        },
        "apps.orders": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False,
        },
    },
}

# Security Best Practices (uncomment and configure properly in production)
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = "DENY"
