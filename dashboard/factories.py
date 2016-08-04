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
    CachedCertificate,
    CachedEnrollment,
)
from courses.factories import CourseRunFactory
from profiles.factories import UserFactory


FAKE = faker.Factory.create()


class CachedCertificateFactory(DjangoModelFactory):
    """Factory for Certificate"""
    user = SubFactory(UserFactory)
    data = FuzzyAttribute(lambda: {'key{}'.format(i): FAKE.text() for i in range(3)})
    course_run = SubFactory(CourseRunFactory)
    # certificates expire after 6 hours, this generates a last request between 6:15 hours ago and now
    last_request = FuzzyDateTime(datetime.now(tz=pytz.utc) - timedelta(hours=6, minutes=15))

    class Meta:  # pylint: disable=missing-docstring,no-init,too-few-public-methods,old-style-class
        model = CachedCertificate


class CachedEnrollmentFactory(DjangoModelFactory):
    """Factory for Enrollment"""
    user = SubFactory(UserFactory)
    data = FuzzyAttribute(lambda: {'key{}'.format(i): FAKE.text() for i in range(3)})
    course_run = SubFactory(CourseRunFactory)
    # enrollments expire after 5 minutes, this generates a last request between 10 minutes ago and now
    last_request = FuzzyDateTime(datetime.now(tz=pytz.utc) - timedelta(minutes=10))

    class Meta:  # pylint: disable=missing-docstring,no-init,too-few-public-methods,old-style-class
        model = CachedEnrollment
