"""
Signals for user profiles
"""
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from dashboard.models import CachedEnrollment, ProgramEnrollment


@receiver(pre_save, sender=CachedEnrollment, dispatch_uid="preupdate_programenrollment")
def precreate_programenrollment(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """
    Signal handler to delete Program enrollment when the CachedEnrollment table is updated
    in case there are no other enrollment in the same program.
    This is done in a pre_save handler because here it is easier to catch the proper kind
    of update (from enrolled to not enrolled).
    """
    # if the id is not None means this is an update
    # if the data is None means we need to check if before was not None
    # meaning if the student was enrolled and now she is not any more
    if instance.data is None and instance.id is not None:
        user = instance.user
        program = instance.course_run.course.program
        # checking if the instance in the db has data
        instance_in_db = CachedEnrollment.objects.filter(id=instance.id).exclude(data__isnull=True).count()
        # if the count is 1, it means the student unenrolled from the course run
        if instance_in_db == 1:
            active_enrollment_count = CachedEnrollment.objects.filter(
                user=user,
                course_run__course__program=program
            ).exclude(data__isnull=True).count()
            # if there is only one enrollment with data non None, it means that it is the
            # current instance is the only one for the program, so the program enrollment
            # needs to be deleted
            if active_enrollment_count <= 1:  # theoretically this cannot be <1, but just in case
                ProgramEnrollment.objects.filter(
                    user=user,
                    program=program
                ).delete()


@receiver(post_save, sender=CachedEnrollment, dispatch_uid="update_programenrollment")
def create_programenrollment(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """
    Signal handler to create Program enrollment when the CachedEnrollment table is updated
    """
    if instance.data is not None:
        ProgramEnrollment.objects.get_or_create(
            user=instance.user,
            program=instance.course_run.course.program
        )
