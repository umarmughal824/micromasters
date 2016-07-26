"""
Signals for user profiles
"""
from django.db.models.signals import post_save
from django.dispatch import receiver

from dashboard.models import CachedEnrollment, ProgramEnrollment


@receiver(post_save, sender=CachedEnrollment, dispatch_uid="update_enrollment")
def create_program_enrollment(sender, instance, created, **kwargs):  # pylint: disable=unused-argument
    """
    Signal handler to create Program enrollment when student
    enrolls in a course.
    """
    if instance.data:
        ProgramEnrollment.objects.get_or_create(
            user=instance.user,
            program=instance.course_run.course.program
        )
