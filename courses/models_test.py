"""
Model tests
"""
# pylint: disable=no-self-use
from django.test import TestCase
from .factories import ProgramFactory, CourseFactory


class ProgramTests(TestCase):
    """Tests for Program model"""

    def test_to_string(self):
        """Test for __str__ method"""
        prog = ProgramFactory.build(title="Title")
        assert "{}".format(prog) == "Title"


class CourseTests(TestCase):
    """Tests for Course model"""

    def test_to_string(self):
        """Test for __str__ method"""
        course = CourseFactory.build(title="Title")
        assert "{}".format(course) == "Title"
