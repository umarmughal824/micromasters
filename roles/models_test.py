"""
Tests for models
"""

from unittest import TestCase

from roles.models import Role
from roles import roles


class MicroMastersRoleTest(TestCase):
    """
    Tests for the MicroMastersRole model
    """

    def test_role_available(self):  # pylint: disable=no-self-use
        """
        Simple test for all the roles available
        """
        for role_key in Role.ASSIGNABLE_ROLES:
            assert role_key in (roles.Staff.ROLE_ID, roles.Instructor.ROLE_ID, )
