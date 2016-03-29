"""Factories for making test data"""
import factory
from factory import fuzzy
from factory.django import DjangoModelFactory

from .models import Program, Course, CourseRun


class ProgramFactory(DjangoModelFactory):
    """Factory for Programs"""
    title = fuzzy.FuzzyText(prefix="Program ")

    class Meta:  # pylint: disable=missing-docstring
        model = Program


class CourseFactory(DjangoModelFactory):
    """Factory for Courses"""
    title = fuzzy.FuzzyText(prefix="Course ")
    program = factory.SubFactory(ProgramFactory)
    position_in_program = factory.Sequence(lambda n: n)

    class Meta:  # pylint: disable=missing-docstring
        model = Course

    @classmethod
    def _setup_next_sequence(cls):
        last = Course.objects.order_by('position_in_program').last()
        if last is not None:
            return last.position_in_program + 1
        return 0


class CourseRunFactory(DjangoModelFactory):
    """Factory for CourseRuns"""
    title = fuzzy.FuzzyText(prefix="CourseRun ")
    course = factory.SubFactory(CourseFactory)

    class Meta:  # pylint: disable=missing-docstring
        model = CourseRun
