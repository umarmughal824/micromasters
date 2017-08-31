"""Discussions utils"""
from django.conf import settings
from open_discussions_api import utils

from discussions.models import DiscussionUser


def get_token_for_user(user):
    """
    Generates a token for the given user

    Args:
        user (django.contrib.auth.models.User): the user to generate a token for

    Returns:
        str: the token or None
    """
    if user.is_anonymous():
        return None

    try:
        discussion_user = user.discussion_user
    except DiscussionUser.DoesNotExist:
        return None

    if discussion_user.username is not None:
        return utils.get_token(
            settings.OPEN_DISCUSSIONS_JWT_SECRET,
            discussion_user.username,
            [],  # no roles for learners,
            expires_delta=settings.OPEN_DISCUSSIONS_COOKIE_EXPIRES_DELTA
        )

    return None
