"""
Factories for dashboard
"""
from datetime import datetime, timedelta
import pytz

from factory import (
    SubFactory,
)
from factory.django import DjangoModelFactory
from factory.fuzzy import (
    FuzzyAttribute,
    FuzzyDateTime,
)
import faker

from dashboard.models import (
    Certificate,
    Enrollment,
)
from courses.factories import CourseRunFactory
from profiles.factories import UserFactory


FAKE = faker.Factory.create()


class CertificateFactory(DjangoModelFactory):
    """Factory for Certificate"""
    user = SubFactory(UserFactory)
    data = FuzzyAttribute(lambda: {'key{}'.format(i): FAKE.text() for i in range(3)})
    course_run = SubFactory(CourseRunFactory)
    # certificates expire after 6 hours, this generates a last request between 6:15 hours ago and now
    last_request = FuzzyDateTime(datetime.now(tz=pytz.utc) - timedelta(0, 0, 0, 0, 6, 15))

    class Meta:  # pylint: disable=missing-docstring,no-init,too-few-public-methods,old-style-class
        model = Certificate


class EnrollmentFactory(DjangoModelFactory):
    """Factory for Enrollment"""
    user = SubFactory(UserFactory)
    data = FuzzyAttribute(lambda: {'key{}'.format(i): FAKE.text() for i in range(3)})
    course_run = SubFactory(CourseRunFactory)
    # enrollments expire after 5 minutes, this generates a last request between 10 minutes ago and now
    last_request = FuzzyDateTime(datetime.now(tz=pytz.utc) - timedelta(0, 0, 0, 0, 0, 10))

    class Meta:  # pylint: disable=missing-docstring,no-init,too-few-public-methods,old-style-class
        model = Enrollment
