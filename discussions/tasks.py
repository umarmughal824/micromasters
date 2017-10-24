"""Tasks for profiles"""
from datetime import timedelta

from celery.utils.log import get_task_logger
from django.conf import settings
from django.core.cache import caches
from redis.lock import LuaLock
from redis.exceptions import LockError

from discussions import api
from discussions.exceptions import DiscussionUserSyncException
from micromasters.celery import app
from micromasters.utils import now_in_utc
from profiles.models import Profile

SYNC_MEMBERSHIPS_LOCK_NAME = 'sync_memberships_lock'

# let it run for up to 2 minutes minus a 5 second buffer
# we do the buffer so the lock is cleared before the next cron run
# this is a trade off of letting it run longer vs. having a stale view
SYNC_MEMBERSHIPS_LOCK_TTL_SECONDS = 60 * 2 - 5

_SYNC_LOCK = None

log = get_task_logger(__name__)


def _get_sync_memberships_lock():
    """
    Lazily instantiates the sync memberships lock

    Returns:
        redis.lock.LuaLock: a redis lua-based lock
    """
    global _SYNC_LOCK  # pylint: disable=global-statement
    if _SYNC_LOCK is None:
        # this is a StrictRedis instance, we need this for the script installation that LuaLock uses
        redis = caches['redis'].client.get_client()
        # don't block acquiring the lock, this runs on a 1-minute cron so we'll try again later
        _SYNC_LOCK = LuaLock(redis, SYNC_MEMBERSHIPS_LOCK_NAME, blocking=False)

    return _SYNC_LOCK


@app.task()
def sync_discussion_user(user_id):
    """
    Sync the user's profile to open discussions

    Args:
        user_id (int): user id
    """
    if not settings.FEATURES.get('OPEN_DISCUSSIONS_USER_SYNC', False):
        return

    try:
        api.create_or_update_discussion_user(user_id)
    except DiscussionUserSyncException:
        log.exception("Error syncing user profile")


@app.task()
def sync_discussion_users():
    """
    Sync the user's profile to open discussions
    """
    if not settings.FEATURES.get('OPEN_DISCUSSIONS_USER_SYNC', False):
        log.debug('OPEN_DISCUSSIONS_USER_SYNC is set to False (so disabled) in the settings')
        return
    users_to_backfill = Profile.objects.exclude(
        user__discussion_user__isnull=False).values_list('user__id', flat=True)

    for user_id in users_to_backfill:
        try:
            api.create_or_update_discussion_user(user_id)
        except DiscussionUserSyncException:
            log.error('Impossible to sync user_id %s to discussions', user_id)


@app.task()
def add_moderators_to_channel(channel_name):
    """
    Add moderators to a open-discussions channel
    """
    if not settings.FEATURES.get('OPEN_DISCUSSIONS_USER_SYNC', False):
        log.debug('OPEN_DISCUSSIONS_USER_SYNC is set to False (so disabled) in the settings')
        return

    api.add_moderators_to_channel(channel_name)


@app.task()
def sync_channel_memberships():
    """
    Syncs outstanding channel memberships
    """
    if not settings.FEATURES.get('OPEN_DISCUSSIONS_USER_SYNC', False):
        log.debug('OPEN_DISCUSSIONS_USER_SYNC is set to False (so disabled) in the settings')
        return

    # establish when we'll stop syncing this "batch"
    end_time = now_in_utc() + timedelta(seconds=SYNC_MEMBERSHIPS_LOCK_TTL_SECONDS)
    lock = _get_sync_memberships_lock()

    def _get_memberships():
        """Generator for membership ids to sync"""
        for membership_id in api.get_membership_ids_needing_sync():
            # this will stop yielding once our lock has expired
            if end_time > now_in_utc():
                yield membership_id
            else:
                break

    if lock.acquire():
        try:
            api.sync_channel_memberships(_get_memberships())
        finally:
            try:
                lock.release()
            except LockError:
                pass  # expected if we don't own the lock anymore
