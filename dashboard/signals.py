"""
Signals for user profiles
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from dashboard.models import ProgramEnrollment
from search.tasks import index_program_enrolled_users, remove_program_enrolled_user


@receiver(post_save, sender=ProgramEnrollment, dispatch_uid="programenrollment_post_save")
def handle_create_programenrollment(sender, instance, created, **kwargs):  # pylint: disable=unused-argument
    """
    When a ProgramEnrollment model is created/updated, update index.
    """
    index_program_enrolled_users.delay([instance])


@receiver(post_delete, sender=ProgramEnrollment, dispatch_uid="programenrollment_post_delete")
def handle_delete_programenrollment(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """
    When a ProgramEnrollment model is deleted, update index.
    """
    remove_program_enrolled_user.delay(instance)
