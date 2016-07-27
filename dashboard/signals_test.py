"""
Tests for signals
"""

import datetime
import pytz

from django.contrib.auth.models import User

from courses.factories import CourseRunFactory
from dashboard.models import ProgramEnrollment, CachedEnrollment
from search.base import ESTestCase


# pylint: disable=no-self-use
class SignalProgramEnrollmentTest(ESTestCase):
    """
    Test class for signals that creates ProgramEnrollment when user enrolls in a class
    """
    @classmethod
    def setUpTestData(cls):
        super(SignalProgramEnrollmentTest, cls).setUpTestData()
        cls.user = User.objects.create(username='test', password='test')
        cls.course_run = CourseRunFactory.create()

    def setUp(self):
        ESTestCase.setUp(self)
        self.now = datetime.datetime.now(tz=pytz.utc)

    def test_program_enrollment_creation(self):
        """
        Tests that if a CachedEnrollment is updated with data
        then ProgramEnrollment is created
        """
        assert ProgramEnrollment.objects.count() == 0
        assert CachedEnrollment.objects.count() == 0
        enrollment = CachedEnrollment.objects.create(
            user=self.user,
            course_run=self.course_run,
            data=None,
            last_request=self.now
        )
        assert ProgramEnrollment.objects.count() == 0
        enrollment.data = {'data': 'data'}
        enrollment.save()
        assert ProgramEnrollment.objects.count() == 1

    def test_program_enrollment_deletion(self):
        """
        Tests that if a CachedEnrollment is updated with data=None
        and there is no other enrollment for runs with the same program
        then the enrollment in the program is deleted.
        """
        enrollment = CachedEnrollment.objects.create(
            user=self.user,
            course_run=self.course_run,
            data={'data': 'data'},
            last_request=self.now
        )
        assert ProgramEnrollment.objects.count() == 1
        enrollment.data = None
        enrollment.save()
        assert ProgramEnrollment.objects.count() == 0

    def test_program_enrollment_no_deletion(self):
        """
        Tests that if a CachedEnrollment is updated with data=None
        and there is another enrollment for runs with the same program
        then the enrollment in the program is not deleted.
        """
        CachedEnrollment.objects.create(
            user=self.user,
            course_run=self.course_run,
            data={'data': 'data'},
            last_request=self.now
        )
        assert ProgramEnrollment.objects.count() == 1
        # create another run under the same program
        another_run = CourseRunFactory.create(course=self.course_run.course)
        # create another enrollment
        another_enrollment = CachedEnrollment.objects.create(
            user=self.user,
            course_run=another_run,
            data={'data': 'data'},
            last_request=self.now
        )
        # the number of enrollments in the programs is still the same
        assert ProgramEnrollment.objects.count() == 1
        # removing the data, will not change the program enrollment
        another_enrollment.data = None
        another_enrollment.save()
        assert ProgramEnrollment.objects.count() == 1
