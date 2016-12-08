"""
Provides functionality for serializing a ProgramEnrollment for the ES index
"""
from dashboard.api_edx_cache import CachedEdxUserData
from dashboard.models import CachedEnrollment
from dashboard.utils import MMTrack
from roles.api import is_learner


class UserProgramSearchSerializer:
    """
    Provides functions for serializing a ProgramEnrollment for the ES index
    """
    @classmethod
    def serialize_enrollments(cls, enrollments):
        """
        Serializes a user's enrollment data for search results

        Args:
            enrollments (iterable): An iterable of CachedEnrollments
        Returns:
            list: Serialized courses
        """
        enrolled_courses = set(enrollment.course_run.course for enrollment in enrollments)
        return [{'title': course.title} for course in enrolled_courses]

    @classmethod
    def serialize(cls, program_enrollment):
        """
        Serializes a ProgramEnrollment object
        """
        user = program_enrollment.user
        program = program_enrollment.program
        edx_user_data = CachedEdxUserData(user, program=program)

        mmtrack = MMTrack(
            user,
            program,
            edx_user_data
        )
        return {
            'id': program.id,
            'enrollments': cls.serialize_enrollments(CachedEnrollment.user_course_qset(user, program=program)),
            'grade_average': mmtrack.calculate_final_grade_average(),
            'is_learner': is_learner(user, program),
            'email_optin': user.profile.email_optin,
        }
