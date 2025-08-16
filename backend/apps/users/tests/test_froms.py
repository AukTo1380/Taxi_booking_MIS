import pytest

from apps.users.factories import UserFactory
from apps.users.forms import UserCreationForm


@pytest.mark.django_db
def test_user_creation_form_valid_data():
    data = {
        "first_name": "john",
        "last_name": "doe",
        "email": "john.doe@gmail.com",
        "password1": "secure_password123",
        "password2": "secure_password123",
    }
    form = UserCreationForm(data)
    assert form.is_valid()


@pytest.mark.django_db
def test_user_creation_form_invalid_data():
    user = UserFactory()
    data = {
        "first_name": "john",
        "last_name": "doe",
        "email": user.email,
        "password1": "secure_password123",
        "password2": "secure_password123",
    }
    form = UserCreationForm(data)
    assert not form.is_valid()
    assert "email" in form.errors
