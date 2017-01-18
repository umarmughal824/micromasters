"""
Tests for grades models
"""
from django.core.exceptions import ValidationError

from courses.factories import CourseRunFactory
from grades.models import (
    CourseRunGradingAlreadyCompleteError,
    CourseRunGradingStatus,
    FinalGrade,
)
from grades.constants import FinalGradeStatus
from micromasters.factories import UserFactory
from search.base import MockedESTestCase


class FinalGradeModelTests(MockedESTestCase):
    """
    Tests for final grade model
    """
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.user1 = UserFactory.create()
        cls.user2 = UserFactory.create()
        cls.course_run = CourseRunFactory.create()

    def test_grade_validation_save(self):
        """
        Tests that the save method performs a full validation of the rade input
        """
        # basic final grade creation
        grade1 = FinalGrade.objects.create(
            user=self.user1,
            course_run=self.course_run,
            grade=0.65,
        )

        # it fails to modify it to a value >1 or <0
        for val in (-0.5, 1.3, ):
            with self.assertRaises(ValidationError):
                grade1.grade = val
                grade1.save()

        # it fails also to create the grades from scratch
        for val in (-0.5, 1.3, ):
            with self.assertRaises(ValidationError):
                FinalGrade.objects.create(
                    user=self.user2,
                    course_run=self.course_run,
                    grade=val,
                )


class CourseRunGradingStatusTests(MockedESTestCase):
    """
    Tests for CourseRunGradingStatus methods
    """
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.course_run_pending = CourseRunFactory.create()
        cls.course_run_complete = CourseRunFactory.create()
        cls.course_run_no_status = CourseRunFactory.create()
        cls.all_runs = (cls.course_run_pending, cls.course_run_complete, cls.course_run_no_status, )
        CourseRunGradingStatus.objects.create(
            course_run=cls.course_run_pending,
            status=FinalGradeStatus.PENDING,
        )
        CourseRunGradingStatus.objects.create(
            course_run=cls.course_run_complete,
            status=FinalGradeStatus.COMPLETE,
        )

    def test_is_complete(self):
        """tests for is_complete method"""
        assert CourseRunGradingStatus.is_complete(self.course_run_pending) is False
        assert CourseRunGradingStatus.is_complete(self.course_run_complete) is True
        assert CourseRunGradingStatus.is_complete(self.course_run_no_status) is False

    def test_is_pending(self):
        """tests for is_pending method"""
        assert CourseRunGradingStatus.is_pending(self.course_run_pending) is True
        assert CourseRunGradingStatus.is_pending(self.course_run_complete) is False
        assert CourseRunGradingStatus.is_pending(self.course_run_no_status) is False

    def test_set_to_complete(self):
        """tests for set_to_complete method"""
        assert CourseRunGradingStatus.is_complete(self.course_run_pending) is False
        assert CourseRunGradingStatus.is_complete(self.course_run_complete) is True
        assert CourseRunGradingStatus.is_complete(self.course_run_no_status) is False
        for course_run in self.all_runs:
            CourseRunGradingStatus.set_to_complete(course_run)
            assert CourseRunGradingStatus.is_complete(course_run) is True

    def test_create_pending(self):
        """tests for create_pending"""
        for course_run in (self.course_run_pending, self.course_run_no_status, ):
            fg_status = CourseRunGradingStatus.create_pending(course_run)
            assert fg_status.status == FinalGradeStatus.PENDING
            assert fg_status.course_run == course_run

        with self.assertRaises(CourseRunGradingAlreadyCompleteError):
            CourseRunGradingStatus.create_pending(self.course_run_complete)
