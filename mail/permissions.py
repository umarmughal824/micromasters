"""
Permission classes for mail views
"""

from rolepermissions.verifications import has_permission
from rest_framework.permissions import BasePermission

from roles.roles import Permissions, Staff, Instructor
from dashboard.models import ProgramEnrollment
from dashboard.utils import MMTrack
from dashboard.api_edx_cache import CachedEdxUserData


class UserCanMessageLearnersPermission(BasePermission):
    """
    Permission class indicating permission to send a message to learners.
    """

    def has_permission(self, request, view):
        """
        Returns True if the user has the 'can_message_learners' permission.
        """
        return has_permission(request.user, Permissions.CAN_MESSAGE_LEARNERS)


class UserCanMessageSpecificLearnerPermission(BasePermission):
    """
    Permission class indicating permission to send a message to a specific learner.
    """

    def has_object_permission(self, request, view, obj):
        """
        Returns True if the user has the permission to message a specific learner.
        Args:
            request (Request): DRF request object
            view (View): DRF view object
            obj (Profile): Recipient Profile object
        Returns:
            boolean
        """
        sender_user = request.user
        if not has_permission(sender_user, Permissions.CAN_MESSAGE_LEARNERS):
            return False
        # Check if the sender is staff/instructor in a program that the recipient
        # is enrolled in.
        return sender_user.role_set.filter(
            role__in=(Staff.ROLE_ID, Instructor.ROLE_ID),
            program__programenrollment__user=obj.user,
        ).exists()


class UserCanMessageCourseTeamPermission(BasePermission):
    """
    Permission class indicating permission to send a message to a course team.
    """

    def has_object_permission(self, request, view, obj):
        """
        Returns True if the user has permission to send a message to a course team.
        Args:
            request (Request): DRF request object
            view (View): DRF view object
            obj (Course): Course object
        Returns:
            boolean
        """
        user = request.user
        program = obj.program
        # Make sure the user has an enrollment in the course's program
        if not ProgramEnrollment.objects.filter(user=user, program=program).exists():
            return False
        # Make sure the user has paid for any course run for the given course
        edx_user_data = CachedEdxUserData(user)
        mmtrack = MMTrack(
            user,
            program,
            edx_user_data
        )
        course_run_keys = obj.courserun_set.values_list('edx_course_key', flat=True)
        return any([mmtrack.has_paid(course_run_key) for course_run_key in course_run_keys])
