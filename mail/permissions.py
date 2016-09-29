"""
Permission classes for mail views
"""

from rolepermissions.verifications import has_permission
from rest_framework.permissions import BasePermission

from roles.roles import Permissions


class UserCanMessageLearnersPermission(BasePermission):
    """
    Permission class indicating permission to send a message to learners.
    """

    def has_permission(self, request, view):
        """
        Returns True if the user has the 'can_message_learners' permission.
        """
        return has_permission(request.user, Permissions.CAN_MESSAGE_LEARNERS)
