"""Factories for making test data"""
import factory
from factory import fuzzy
from factory.django import DjangoModelFactory

from .models import Program, Course


class ProgramFactory(DjangoModelFactory):
    """Factory for Programs"""
    title = fuzzy.FuzzyText(prefix="Program ")

    class Meta:  # pylint: disable=missing-docstring
        model = Program


class CourseFactory(DjangoModelFactory):
    """Factory for Courses"""
    title = fuzzy.FuzzyText(prefix="Course ")
    program = factory.SubFactory(ProgramFactory)

    class Meta:  # pylint: disable=missing-docstring
        model = Course
