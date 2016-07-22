"""
Models for dashboard
"""

from django.contrib.auth.models import User
from django.db.models import (
    DateTimeField,
    ForeignKey,
    Model,
)
from jsonfield import JSONField

from courses.models import CourseRun


class CachedEnrollment(Model):
    """
    Model for user enrollment data from edX
    """
    user = ForeignKey(User)
    course_run = ForeignKey(CourseRun)
    data = JSONField(null=True)
    last_request = DateTimeField()

    class Meta:
        unique_together = (('user', 'course_run'), )

    def __str__(self):
        """
        String representation of the model object
        """
        return 'user "{0}", run "{1}", has_data={2}'.format(
            self.user.username,
            self.course_run.edx_course_key,
            self.data is not None,
        )


class CachedCertificate(Model):
    """
    Model for certificate data from edX
    """
    user = ForeignKey(User)
    course_run = ForeignKey(CourseRun)
    data = JSONField(null=True)
    last_request = DateTimeField()

    class Meta:
        unique_together = (('user', 'course_run'), )

    def __str__(self):
        """
        String representation of the model object
        """
        return 'user "{0}", run "{1}", has_data={2}'.format(
            self.user.username,
            self.course_run.edx_course_key,
            self.data is not None,
        )
