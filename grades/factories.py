"""Factories for the grades app"""
from factory import SubFactory, Faker
from factory.django import DjangoModelFactory
from factory.fuzzy import FuzzyFloat

from courses.factories import CourseRunFactory
from grades.constants import FinalGradeStatus
from grades.models import FinalGrade
from micromasters.factories import UserFactory


class FinalGradeFactory(DjangoModelFactory):
    """Factory for FinalGrade"""
    user = SubFactory(UserFactory)
    course_run = SubFactory(CourseRunFactory)
    grade = FuzzyFloat(low=0, high=1)
    passed = Faker('boolean')
    status = FinalGradeStatus.COMPLETE

    class Meta:  # pylint: disable=missing-docstring,no-init,too-few-public-methods,old-style-class
        model = FinalGrade
