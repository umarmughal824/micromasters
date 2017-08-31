"""APIs for discussions"""
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import redirect
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from discussions.utils import get_token_for_user


def _set_jwt_cookie(response, token):
    """
    Set the token on the response

    Args:
        response (django.http.Response): the response to set the cookie on
        token (str): the JWT token
    """
    response.set_cookie(
        settings.OPEN_DISCUSSIONS_COOKIE_NAME,
        token,
        domain=settings.OPEN_DISCUSSIONS_COOKIE_DOMAIN,
        httponly=True,
        max_age=settings.OPEN_DISCUSSIONS_COOKIE_EXPIRES_DELTA
    )


@api_view()
def discussions_token(request):
    """
    API view for setting discussions JWT token
    """
    token = get_token_for_user(request.user)
    if token is not None:
        response = Response({
            'has_token': True
        })
        _set_jwt_cookie(response, token)
    else:
        response = Response({
            'has_token': False
        }, status=status.HTTP_403_FORBIDDEN)
    return response


@login_required
def discussions_redirect(request):
    """
    View for setting discussions JWT token and redirecting to discussions
    """
    token = get_token_for_user(request.user)
    if token is not None:
        response = redirect(settings.OPEN_DISCUSSIONS_REDIRECT_URL)
        _set_jwt_cookie(response, token)
    else:
        response = HttpResponse('', status=status.HTTP_409_CONFLICT)

    return response
