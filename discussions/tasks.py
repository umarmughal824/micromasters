"""Tasks for profiles"""
import logging

from django.conf import settings

from discussions import api
from discussions.exceptions import DiscussionUserSyncException
from micromasters.celery import app


log = logging.getLogger(__name__)


@app.task()
def sync_discussion_user(profile_id):
    """
    Sync the user's profile to open discusssions

    Args:
        profile_id (str): profile id
    """
    if not settings.FEATURES.get('OPEN_DISCUSSIONS_USER_SYNC', False):
        return

    try:
        api.create_or_update_discussion_user(profile_id)
    except DiscussionUserSyncException:
        log.exception("Error syncing user profile")
