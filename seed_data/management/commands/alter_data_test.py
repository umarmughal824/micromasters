"""
Tests for alter_data commands
"""
from decimal import Decimal
from search.base import MockedESTestCase
from seed_data.management.commands.alter_data import (
    set_to_passed,
    set_to_failed,
)
from micromasters.factories import UserFactory
from courses.factories import CourseRunFactory
from dashboard.utils import get_mmtrack


class AlterDataCommandTests(MockedESTestCase):
    """Test cases for alter_data commands"""
    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory.create()
        cls.course_run = CourseRunFactory.create()

    def test_set_to_passed(self):
        """set_to_passed should set a CourseRun to passed for a given User"""
        grade = Decimal('0.75')
        set_to_passed(user=self.user, course_run=self.course_run, grade=grade)
        mmtrack = get_mmtrack(self.user, self.course_run.course.program)
        assert mmtrack.has_passed_course(self.course_run.edx_course_key)
        assert int(mmtrack.get_final_grade_percent(self.course_run.edx_course_key)) == (grade * 100)

    def test_set_to_failed(self):
        """set_to_failed should set a CourseRun to failed for a given User"""
        grade = Decimal('0.55')
        set_to_failed(user=self.user, course_run=self.course_run, grade=grade)
        mmtrack = get_mmtrack(self.user, self.course_run.course.program)
        assert not mmtrack.has_passed_course(self.course_run.edx_course_key)
        assert int(mmtrack.get_final_grade_percent(self.course_run.edx_course_key)) == (grade * 100)
