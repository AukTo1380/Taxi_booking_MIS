from os import getenv, path
from dotenv import load_dotenv  # type: ignore
from .base import *  # noqa
from .base import ROOT_DIR

local_env_file = path.join(ROOT_DIR, ".env", ".env")
if path.isfile(local_env_file):
    load_dotenv(local_env_file)

DEBUG = getenv("DEBUG")
SITE_NAME = getenv("SITE_NAME")
ALLOWED_HOSTS = getenv("ALLOWED_HOSTS", "localhost,127.0.0.1,0.0.0.0").split(",")
SECRET_KEY = getenv("DJANGO_SECRET_KEY")
ADMIN_URL = getenv("ADMIN_URL")
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = getenv("EMAIL_HOST")
EMAIL_PORT = getenv("EMAIL_PORT")
DEFAULT_FROM_EMAIL = getenv("DEFAULT_FROM_EMAIL", default="alisinasultani@gmail.com")
MAX_UPLOAD_SIZE = 1 * 1024 * 1024
CELERY_BROKER_URL = "redis://localhost:6379/0"
CELERY_RESULT_BACKEND = "redis://localhost:6379/0"
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_TIMEZONE = "UTC"
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
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
        "apps.orders": {
            "handlers": ["console"],
            "level": "WARNING",  # This will hide INFO logs
            "propagate": False,
        },
    },
}
