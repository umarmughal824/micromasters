"""
Tests for serializers
"""

from django.test import TestCase

from courses.factories import CourseRunFactory
from courses.serializers import CourseRunSerializer


class CourseRunSerializerTests(TestCase):
    """
    Tests for CourseRunSerializer
    """

    def test_program(self):  # pylint: disable=no-self-use
        """
        Make sure program id appears correctly
        """
        course_run = CourseRunFactory.create()
        result = CourseRunSerializer().to_representation(course_run)
        assert result['program'] == course_run.course.program.id
