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
from dashboard.models import (
    Certificate,
    Enrollment,
)
from search.tasks import index_users, remove_user

log = logging.getLogger(__name__)


@receiver(post_save)
def handle_update(sender, **kwargs):  # pylint: disable=unused-argument
    """Update index when a relevant model is updated."""
    instance = kwargs["instance"]
    if isinstance(instance, (Certificate, Enrollment, Profile)):
        index_users.delay([instance.user])
    elif isinstance(instance, (Education, Employment)):
        index_users.delay([instance.profile.user])


@receiver(post_delete)
def handle_delete(sender, **kwargs):  # pylint: disable=unused-argument
    """Update index when a relevant model is deleted."""
    instance = kwargs['instance']
    if isinstance(instance, Profile):
        remove_user.delay(instance.user)
    elif isinstance(instance, (Education, Employment)):
        index_users.delay([instance.profile.user])
    elif isinstance(instance, (Certificate, Enrollment)):
        index_users.delay([instance.user])
