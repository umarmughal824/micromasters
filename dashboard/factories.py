"""
Factories for dashboard
"""
from datetime import datetime, timedelta
from random import randint
import pytz

from factory import SubFactory, LazyAttribute
from factory.django import DjangoModelFactory
from factory.fuzzy import (
    FuzzyAttribute,
    FuzzyDateTime,
)
import faker

from dashboard.models import (
    CachedCertificate,
    CachedCurrentGrade,
    CachedEnrollment,
    ProgramEnrollment,
)
from courses.factories import (
    CourseRunFactory,
    CourseFactory,
    ProgramFactory,
)
from micromasters.factories import UserFactory


FAKE = faker.Factory.create()


class CachedCertificateFactory(DjangoModelFactory):
    """Factory for Certificate"""
    user = SubFactory(UserFactory)
    course_run = SubFactory(CourseRunFactory)
    data = LazyAttribute(lambda x: {
        "certificate_type": "verified",
        "grade": randint(60, 100)/100.0,
        "course_id": x.course_run.edx_course_key,
    })
    # certificates expire after 6 hours, this generates a last request between 6:15 hours ago and now
    last_request = FuzzyDateTime(datetime.now(tz=pytz.utc) - timedelta(hours=6, minutes=15))

    class Meta:  # pylint: disable=missing-docstring,no-init,too-few-public-methods,old-style-class
        model = CachedCertificate


class CachedCurrentGradeFactory(DjangoModelFactory):
    """Factory for CurrentGrade"""
    user = SubFactory(UserFactory)
    course_run = SubFactory(CourseRunFactory)
    data = LazyAttribute(lambda x: {
        "passed": FuzzyAttribute(FAKE.boolean),
        "percent": randint(60, 100)/100.0,
        "course_key": x.course_run.edx_course_key,
    })

    # certificates expire after 6 hours, this generates a last request between 6:15 hours ago and now
    last_request = FuzzyDateTime(datetime.now(tz=pytz.utc) - timedelta(hours=6, minutes=15))

    class Meta:  # pylint: disable=missing-docstring,no-init,too-few-public-methods,old-style-class
        model = CachedCurrentGrade


class CachedEnrollmentFactory(DjangoModelFactory):
    """Factory for Enrollment"""
    user = SubFactory(UserFactory)
    course_run = SubFactory(CourseRunFactory)
    data = LazyAttribute(lambda x: {
        "is_active": True,
        "mode": "verified",
        "course_details": {
            "course_id": x.course_run.edx_course_key,
        }
    })
    # enrollments expire after 5 minutes, this generates a last request between 10 minutes ago and now
    last_request = FuzzyDateTime(datetime.now(tz=pytz.utc) - timedelta(minutes=10))

    class Meta:  # pylint: disable=missing-docstring,no-init,too-few-public-methods,old-style-class
        model = CachedEnrollment


class ProgramEnrollmentFactory(DjangoModelFactory):
    """Factory for ProgramEnrollment"""
    user = SubFactory(UserFactory)
    program = SubFactory(ProgramFactory)

    class Meta:  # pylint: disable=missing-docstring,no-init,too-few-public-methods,old-style-class
        model = ProgramEnrollment

    @classmethod
    def create(cls, **kwargs):
        """
        Overrides default ProgramEnrollment object creation for the factory.
        """
        user = kwargs.get('user', UserFactory.create())
        program = kwargs.get('program', ProgramFactory.create())
        course = CourseFactory.create(program=program)
        course_run = CourseRunFactory.create(course=course)
        CachedEnrollmentFactory.create(user=user, course_run=course_run)
        CachedCertificateFactory.create(user=user, course_run=course_run)
        program_enrollment = ProgramEnrollment.objects.create(user=user, program=program)
        return program_enrollment
