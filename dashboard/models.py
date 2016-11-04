"""
Models for dashboard
"""

from django.contrib.auth.models import User
from django.contrib.postgres.fields import JSONField
from django.db.models import (
    DateTimeField,
    ForeignKey,
    Model,
)
from courses.models import CourseRun, Program


class CachedEdxInfoModel(Model):
    """
    Base class to define other cached models
    """
    user = ForeignKey(User)
    course_run = ForeignKey(CourseRun)
    data = JSONField(null=True)
    last_request = DateTimeField()

    class Meta:
        unique_together = (('user', 'course_run'), )
        abstract = True

    @classmethod
    def active_qset(cls, user, program):
        """
        Returns a queryset for the active records associated with a User/Program pair
        """
        return cls.objects.filter(
            user=user,
            course_run__course__program=program
        ).exclude(data__isnull=True)

    @classmethod
    def active_count(cls, user, program):
        """
        Returns the number of active records associated with a User/Program pair
        """
        return cls.active_qset(user, program).count()

    @classmethod
    def active_data(cls, user, program):
        """
        Returns a list containing the 'data' property of every active record associated
        with a User/Program pair
        """
        return cls.active_qset(user, program).values_list('data', flat=True).all()

    def __str__(self):
        """
        String representation of the model object
        """
        return 'user "{0}", run "{1}", has_data={2}'.format(
            self.user.username,
            self.course_run.edx_course_key,
            self.data is not None,
        )


class CachedEnrollment(CachedEdxInfoModel):
    """
    Model for user enrollment data from edX
    """


class CachedCertificate(CachedEdxInfoModel):
    """
    Model for certificate data from edX
    """


class CachedCurrentGrade(CachedEdxInfoModel):
    """
    Model for current grade data from edX
    """


class UserCacheRefreshTime(Model):
    """
    Model to store the last refresh timestamp for each of the edX cached info model.
    """
    user = ForeignKey(User)
    enrollment = DateTimeField(null=True)
    certificate = DateTimeField(null=True)
    current_grade = DateTimeField(null=True)


class ProgramEnrollment(Model):
    """
    Model for student enrollments in Programs
    """
    user = ForeignKey(User)
    program = ForeignKey(Program)

    class Meta:
        unique_together = (('user', 'program'), )

    @classmethod
    def prefetched_qset(cls):
        """
        Returns a queryset that will prefetch Program and User (with Profile)
        """
        return cls.objects.select_related('user__profile', 'program')

    def __str__(self):
        """
        String representation of the model object
        """
        return 'user "{0}" enrolled in program "{1}"'.format(
            self.user.username,
            self.program.title
        )
