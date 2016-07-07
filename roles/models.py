"""
General models for the micromasters app
"""

from django.contrib.auth.models import User
from django.db import models

from courses.models import Program
from roles.roles import Staff, Instructor


class Role(models.Model):
    """
    Assignment of a MicroMasters Role per program to a user.

    The role names MUST have a correspondent logical role in roles.py
    and the name MUST be a snake-case version of the correspondent class name
    Example: if the logical role class in roles.py is `FooRole`, the
    instance here must me `foo_role`.
    """
    ASSIGNABLE_ROLES = [Staff.ROLE_ID, Instructor.ROLE_ID]
    DEFAULT_ROLE = Staff.ROLE_ID

    user = models.ForeignKey(User)
    program = models.ForeignKey(Program)
    role = models.CharField(
        choices=[(role_id, role_id) for role_id in ASSIGNABLE_ROLES],
        default=DEFAULT_ROLE,
        max_length=30,
    )

    class Meta:
        unique_together = ('user', 'program', 'role',)
