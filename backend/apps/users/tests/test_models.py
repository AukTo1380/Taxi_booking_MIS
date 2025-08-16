import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
def test_create_normal_user(normal_user):
    assert normal_user.first_name is not None
    assert normal_user.last_name is not None
    assert normal_user.email is not None
    assert normal_user.password is not None
    assert not normal_user.is_superuser
    assert normal_user.is_active


@pytest.mark.django_db
def test_create_superuser(super_user):
    assert super_user.first_name is not None
    assert super_user.last_name is not None
    assert super_user.email is not None
    assert super_user.password is not None
    assert super_user.is_superuser
    assert super_user.is_active


@pytest.mark.django_db
def test_get_full_name(normal_user):
    full_name = normal_user.get_full_name
    expected_full_name = (
        f"{normal_user.first_name.title()} {normal_user.last_name.title()}"
    )
    assert full_name == expected_full_name


@pytest.mark.django_db
def test_get_short_name(normal_user):
    short_name = normal_user.get_short_name
    assert short_name == normal_user.first_name


@pytest.mark.django_db
def test_update_user(normal_user):
    new_first_name = "John"
    new_last_name = "Don"
    normal_user.first_name = new_first_name
    normal_user.last_name = new_last_name
    normal_user.save()
    updated_user = User.objects.get(pk=normal_user.pk)
    assert updated_user.first_name == new_first_name
    assert updated_user.last_name == new_last_name


@pytest.mark.django_db
def test_delete_user(normal_user):
    user_pk = normal_user.pk
    normal_user.delete()
    with pytest.raises(User.DoesNotExist):
        User.objects.get(pk=user_pk)


@pytest.mark.django_db
def test_use_str(normal_user):
    assert str(normal_user) == normal_user.first_name


@pytest.mark.django_db
def test_normal_user_email_normalized(normal_user):
    assert normal_user.email == normal_user.email.lower()


@pytest.mark.django_db
def test_super_user_email_is_normalized(super_user):
    assert super_user.email == super_user.email.lower()


@pytest.mark.django_db
def test_user_email_incorrect(user_factory):
    with pytest.raises(ValueError) as err:
        user_factory.create(email="realestate.com")
    assert str(err.value) == "Users must have a valid email address."


@pytest.mark.django_db
def test_create_user_with_no_firstname(user_factory):
    with pytest.raises(ValueError) as err:
        user_factory.create(first_name=None)
    assert str(err.value) == "Users must have a first name."


@pytest.mark.django_db
def test_create_user_with_no_last_name(user_factory):
    with pytest.raises(ValueError) as err:
        user_factory.create(last_name=None)
    assert str(err.value) == "Users must have a last name."


@pytest.mark.django_db
def test_create_user_with_no_email(user_factory):
    with pytest.raises(ValueError) as err:
        user_factory.create(email=None)
    assert str(err.value) == "Users must have an email address."


@pytest.mark.django_db
def test_create_superuser_with_no_email():
    with pytest.raises(ValueError) as err:
        User.objects.create_superuser(
            first_name="Jane",
            last_name="Doe",
            email=None,
            password="password123",
            is_superuser=True,
            is_staff=True,
        )
    assert str(err.value) == "Superuser must have an email address."


@pytest.mark.django_db
def test_create_superuser_with_no_password():
    with pytest.raises(ValueError) as err:
        User.objects.create_superuser(
            first_name="Jane",
            last_name="Doe",
            email="admin@example.com",
            password=None,
            is_superuser=True,
            is_staff=True,
        )
    assert str(err.value) == "Superuser must have a password."


@pytest.mark.django_db
def test_create_super_user_is_not_staff():
    with pytest.raises(ValueError) as err:
        User.objects.create_superuser(
            first_name="Jane",
            last_name="Doe",
            email="admin@example.com",
            password="password123",
            is_superuser=True,
            is_staff=False,
        )
    assert str(err.value) == "Superuser must have is_staff=True."


@pytest.mark.django_db
def test_create_super_user_is_not_superuser():
    with pytest.raises(ValueError) as err:
        User.objects.create_superuser(
            first_name="Jane",
            last_name="Doe",
            email="admin@example.com",
            password="password123",
            is_superuser=False,
            is_staff=True,
        )
    assert str(err.value) == "Superuser must have is_superuser=True."
