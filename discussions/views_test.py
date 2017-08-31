"""
Tests for discussions views
"""
from django.core.urlresolvers import reverse

import pytest

from discussions.models import DiscussionUser
from micromasters.factories import UserFactory

pytestmark = pytest.mark.django_db


def test_anonymous_user_jwt_api(client):
    """
    Tests that anonymous users gets no token
    """
    response = client.get(reverse('discussions_token'))
    assert response.json() == dict(has_token=False)
    assert response.status_code == 403
    assert 'jwt_cookie' not in response.client.cookies


def test_user_jwt_api(settings, client):
    """
    Tests that anonymous users gets no token
    """
    settings.OPEN_DISCUSSIONS_JWT_SECRET = 'secret'
    settings.OPEN_DISCUSSIONS_COOKIE_NAME = 'jwt_cookie'
    settings.OPEN_DISCUSSIONS_COOKIE_DOMAIN = 'localhost'
    settings.OPEN_DISCUSSIONS_REDIRECT_URL = 'http://localhost/'

    user = UserFactory.create()
    DiscussionUser.objects.create(user=user, username='username')

    client.force_login(user)
    response = client.get(reverse('discussions_token'))
    assert response.json() == dict(has_token=True)
    assert 'jwt_cookie' in response.client.cookies
    assert response.client.cookies['jwt_cookie'] is not None


def test_anonymous_user_403(client):
    """
    Tests that anonymous users get a 403
    """
    response = client.get(reverse('discussions'))
    assert response.status_code == 302
    assert response.url == '/?next={}'.format(reverse('discussions'))
    assert 'jwt_cookie' not in response.client.cookies


def test_logged_in_user_redirect(settings, client):
    """
    Tests that logged in user gets cookie and redirect
    """
    settings.OPEN_DISCUSSIONS_JWT_SECRET = 'secret'
    settings.OPEN_DISCUSSIONS_COOKIE_NAME = 'jwt_cookie'
    settings.OPEN_DISCUSSIONS_COOKIE_DOMAIN = 'localhost'
    settings.OPEN_DISCUSSIONS_REDIRECT_URL = 'http://localhost/'

    user = UserFactory.create()
    DiscussionUser.objects.create(user=user, username='username')

    client.force_login(user)
    response = client.get(reverse('discussions'), follow=True)
    assert response.redirect_chain[0] == ('http://localhost/', 302)
    assert 'jwt_cookie' in response.client.cookies
    assert response.client.cookies['jwt_cookie'] is not None


def test_logged_in_user_redirect_no_username(client):
    """
    Tests that logged in user gets cookie and redirect
    """
    user = UserFactory.create()
    DiscussionUser.objects.create(user=user, username=None)

    client.force_login(user)
    response = client.get(reverse('discussions'), follow=True)
    assert response.status_code == 409
    assert 'jwt_cookie' not in response.client.cookies
