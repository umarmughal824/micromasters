"""
Permission classes for profiles
"""
from rest_framework.permissions import (
    BasePermission,
    SAFE_METHODS,
)


class CanEditIfOwner(BasePermission):
    """
    Only owner of a profile has permission to edit the profile.
    """

    def has_object_permission(self, request, view, profile):
        """
        Only allow editing for owner of the profile.
        """
        if request.method in SAFE_METHODS:
            return True

        return profile.user == request.user
