"""
Signals for user profiles
"""
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver

from dashboard.models import CachedEnrollment, CachedCertificate, ProgramEnrollment
from search.tasks import index_program_enrolled_users, index_users, remove_program_enrolled_user


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
            # if there is only one enrollment with data non None, it means that it is the
            # current instance is the only one for the program, so the program enrollment
            # needs to be deleted
            if CachedEnrollment.active_count(user, program) <= 1:  # theoretically this cannot be <1, but just in case
                ProgramEnrollment.objects.filter(
                    user=user,
                    program=program
                ).delete()


@receiver(post_save, sender=CachedEnrollment, dispatch_uid="cachedenrollment_post_save")
def handle_update_enrollment(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """
    Create ProgramEnrollment when a CachedEnrollment is created/updated, and update the index.
    """
    if instance.data is not None:
        program_enrollment, _ = ProgramEnrollment.objects.get_or_create(
            user=instance.user,
            program=instance.course_run.course.program
        )
        index_program_enrolled_users.delay([program_enrollment])


@receiver(post_save, sender=CachedCertificate, dispatch_uid="cachedcertificate_post_save")
def handle_update_certificate(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """
    When a CachedCertificate model is updated, update index.
    """
    if instance.data is not None:
        program_enrollment, _ = ProgramEnrollment.objects.get_or_create(
            user=instance.user,
            program=instance.course_run.course.program
        )
        index_program_enrolled_users.delay([program_enrollment])


@receiver(post_delete, sender=CachedEnrollment, dispatch_uid="cachedenrollment_post_delete")
def handle_delete_enrollment(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """
    Update index when CachedEnrollment model instance is deleted.
    """
    user = instance.user
    program = instance.course_run.course.program
    program_enrollment = ProgramEnrollment.objects.filter(user=user, program=program).first()
    if program_enrollment is not None:
        if CachedEnrollment.active_count(user, program) == 0:
            program_enrollment.delete()
            index_users.delay([user])
        else:
            index_program_enrolled_users.delay([program_enrollment])


@receiver(post_delete, sender=CachedCertificate, dispatch_uid="cachedcertificate_post_delete")
def handle_delete_certificate(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """
    Update index when CachedCertificate model instance is deleted.
    """
    user = instance.user
    program = instance.course_run.course.program
    program_enrollment = ProgramEnrollment.objects.filter(user=user, program=program).first()
    if program_enrollment is not None:
        index_program_enrolled_users.delay([program_enrollment])
