"""
Models for dashboard
"""

from django.contrib.auth.models import User
from django.db.models import (
    DateTimeField,
    ForeignKey,
    Model,
    OneToOneField,
)
from jsonfield import JSONField

from courses.models import CourseRun


class Enrollment(Model):
    """
    Model for user enrollment data from edX
    """
    user = ForeignKey(User)
    course_run = ForeignKey(CourseRun)
    data = JSONField()
    last_request = DateTimeField()

    class Meta:
        unique_together = (('user', 'course_run'), )


class Certificate(Model):
    """
    Model for certificate data from edX
    """
    user = ForeignKey(User)
    course_run = ForeignKey(CourseRun)
    data = JSONField()
    last_request = DateTimeField()

    class Meta:
        unique_together = (('user', 'course_run'), )
