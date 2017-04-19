"""
Signals for exams
"""
import logging

from django.db.models.signals import post_save
from django.dispatch import receiver


from dashboard.models import CachedEnrollment
from dashboard.utils import get_mmtrack
from exams.api import authorize_for_exam_run
from exams.exceptions import ExamAuthorizationException
from exams.models import (
    ExamProfile,
    ExamRun,
)
from exams.utils import is_eligible_for_exam

from exams import tasks
from grades.models import FinalGrade
from profiles.models import Profile


log = logging.getLogger(__name__)


@receiver(post_save, sender=Profile, dispatch_uid="update_exam_profile")
def update_exam_profile(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """
    Signal handler to trigger a sync of the profile if an ExamProfile record exists for it.
    """
    ExamProfile.objects.filter(profile_id=instance.id).update(status=ExamProfile.PROFILE_PENDING)


@receiver(post_save, sender=ExamRun, dispatch_uid="update_exam_run")
def update_exam_run(sender, instance, created, **kwargs):  # pylint: disable=unused-argument
    """If we update an ExamRun, update ExamAuthorizations accordingly"""
    if not created:
        tasks.update_exam_run.delay(instance.id)


@receiver(post_save, sender=FinalGrade, dispatch_uid="update_exam_authorization_final_grade")
def update_exam_authorization_final_grade(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """
    Signal handler to trigger an exam profile and authorization for FinalGrade creation.
    """
    mmtrack = get_mmtrack(instance.user, instance.course_run.course.program)

    # for each ExamRun for this course that is currently schedulable, attempt to authorize the user
    for exam_run in ExamRun.get_currently_schedulable(instance.course_run.course):
        try:
            authorize_for_exam_run(mmtrack, instance.course_run, exam_run)
        except ExamAuthorizationException:
            log.debug(
                'Unable to authorize user: %s for exam on course_id: %s',
                instance.user.username,
                instance.course_run.course.id
            )


@receiver(post_save, sender=CachedEnrollment, dispatch_uid="update_exam_authorization_cached_enrollment")
def update_exam_authorization_cached_enrollment(sender, instance, **kwargs):  # pylint: disable=unused-argument
    """
    Signal handler to trigger an exam profile when user enroll in a course.
    """
    mmtrack = get_mmtrack(instance.user, instance.course_run.course.program)
    if is_eligible_for_exam(mmtrack, instance.course_run):
        # if user paid for a course then create his exam profile if it is not created yet.
        ExamProfile.objects.get_or_create(profile=mmtrack.user.profile)
