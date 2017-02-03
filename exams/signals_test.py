"""
Tests for exam signals
"""
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.test.utils import override_settings
from factory.django import mute_signals

from dashboard.factories import (
    CachedCertificateFactory,
    CachedCurrentGradeFactory,
    CachedEnrollmentFactory,
)
from exams.models import (
    ExamProfile,
    ExamAuthorization
)
from ecommerce.factories import (
    OrderFactory,
    LineFactory,
)
from financialaid.api_test import create_program
from grades.factories import FinalGradeFactory
from profiles.factories import ProfileFactory
from search.base import MockedESTestCase


# pylint: disable=no-self-use

class ExamSignalsTest(MockedESTestCase):
    """
    Tests for exam signals
    """

    @classmethod
    def setUpTestData(cls):
        with mute_signals(post_save):
            cls.profile = ProfileFactory.create()

        program, _ = create_program(past=True)
        cls.course_run = course_run = program.course_set.first().courserun_set.first()
        CachedCurrentGradeFactory.create(
            user=cls.profile.user,
            course_run=course_run,
            data={
                "passed": True,
                "percent": 0.9,
                "course_key": course_run.edx_course_key,
                "username": cls.profile.user.username
            }
        )
        CachedCertificateFactory.create(user=cls.profile.user, course_run=course_run)
        order = OrderFactory.create(user=cls.profile.user, status='fulfilled')
        LineFactory.create(order=order, course_key=course_run.edx_course_key)

    def test_update_exam_profile_called(self):
        """
        Verify that update_exam_profile is called when a profile saves
        """
        user = User.objects.create(username='test')
        profile = user.profile
        profile_exam = ExamProfile.objects.create(
            profile=profile,
            status=ExamProfile.PROFILE_SUCCESS,
        )
        profile.first_name = 'NewName'
        profile.save()

        profile_exam.refresh_from_db()

        assert profile_exam.status == ExamProfile.PROFILE_PENDING

    @override_settings(FEATURES={"FINAL_GRADE_ALGORITHM": "v1"})
    def test_update_exam_authorization_final_grade(self):
        """
        Verify that update_exam_authorization_final_grade is called when a FinalGrade saves
        """
        FinalGradeFactory.create(
            user=self.profile.user,
            course_run=self.course_run,
            passed=True,
        )

        # assert Exam Authorization and profile created.
        self.assertTrue(ExamProfile.objects.filter(profile=self.profile).exists())
        self.assertTrue(ExamAuthorization.objects.filter(
            user=self.profile.user,
            course=self.course_run.course
        ).exists())

    @override_settings(FEATURES={"FINAL_GRADE_ALGORITHM": "v0"})
    def test_update_exam_authorization_cached_enrollment(self):
        """
        Verify that update_exam_authorization_final_grade is called when a CachedEnrollment saves
        """
        CachedEnrollmentFactory.create(user=self.profile.user, course_run=self.course_run)
        # assert Exam Authorization and profile created. CachedEnrollmentFactory triggered the signal.
        self.assertTrue(ExamProfile.objects.filter(profile=self.profile).exists())
        self.assertTrue(ExamAuthorization.objects.filter(
            user=self.profile.user,
            course=self.course_run.course
        ).exists())
