"""
Signals used for indexing
"""

import logging

from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from profiles.models import (
    Education,
    Employment,
    Profile,
)
from search.tasks import index_users, remove_user

log = logging.getLogger(__name__)


# all the following signal handlers do basically the same.
# The reason why there is one function per sender is
# because each signal handler needs to be hooked to a single sender
# otherwise it would run for any `post_save`/`post_delete` coming from any model


@receiver(post_save, sender=Profile, dispatch_uid="profile_post_save_index")
def handle_update_profile(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """Update index when Profile model is updated."""
    index_users.delay([instance.user])


@receiver(post_save, sender=Education, dispatch_uid="education_post_save_index")
def handle_update_education(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """Update index when Education model is updated."""
    index_users.delay([instance.profile.user])


@receiver(post_save, sender=Employment, dispatch_uid="employment_post_save_index")
def handle_update_employment(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """Update index when Employment model is updated."""
    index_users.delay([instance.profile.user])


@receiver(post_delete, sender=Profile, dispatch_uid="profile_post_delete_index")
def handle_delete_profile(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """Update index when Profile model instance is deleted."""
    remove_user.delay(instance.user)


@receiver(post_delete, sender=Education, dispatch_uid="education_post_delete_index")
def handle_delete_education(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """Update index when Education model instance is deleted."""
    index_users.delay([instance.profile.user])


@receiver(post_delete, sender=Employment, dispatch_uid="employment_post_delete_index")
def handle_delete_employment(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """Update index when Employment model instance is deleted."""
    index_users.delay([instance.profile.user])
