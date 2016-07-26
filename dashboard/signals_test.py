"""
Tests for signals
"""

import datetime
import pytz

from django.contrib.auth.models import User
from dashboard.models import ProgramEnrollment, CachedEnrollment
from courses.models import Program, Course, CourseRun
from search.base import ESTestCase


# pylint: disable=no-self-use
class SignalProgramEnrollmentTest(ESTestCase):
    """
    Test class for signals that creates ProgramEnrollment when user enrolls in a class
    """
    def test_program_enrollment_creation(self):
        """
        Tests that if a CachedEnrollment is updated with data
        then ProgramEnrollment is created
        """
        # there are no users
        assert ProgramEnrollment.objects.count() == 0
        assert CachedEnrollment.objects.count() == 0
        now = datetime.datetime.now(tz=pytz.utc)
        user = User.objects.create(username='test', password='test')
        program = Program.objects.create(title='New Program', live=True)
        course = Course.objects.create(program=program, title="Test Course")
        course_run = CourseRun.objects.create(course=course, title="Test Run")
        enrollment = CachedEnrollment.objects.create(
            user=user,
            course_run=course_run,
            data=None,
            last_request=now
        )
        assert ProgramEnrollment.objects.count() == 0
        enrollment.data = {'data': 'data'}
        enrollment.save()
        assert ProgramEnrollment.objects.count() == 1
