"""
Celery tasks for search
"""

from micromasters.celery import async
from search.api import (
    index_program_enrolled_users as _index_program_enrolled_users,
    remove_program_enrolled_user as _remove_program_enrolled_user,
    index_users as _index_users,
    remove_user as _remove_user
)


@async.task
def remove_program_enrolled_user(user):
    """
    Remove program-enrolled user from index

    Args:
        user (User): A program-enrolled user to remove from index
    """
    _remove_program_enrolled_user(user)


@async.task
def index_program_enrolled_users(program_enrollments):
    """
    Index profiles

    Args:
        program_enrollments (iterable of ProgramEnrollments): Program-enrolled users to remove from index
    """
    _index_program_enrolled_users(program_enrollments)


@async.task
def index_users(users):
    """
    Index users

    Args:
        users (iterable of Users): Users to remove from index
    """
    _index_users(users)


@async.task
def remove_user(user):
    """
    Remove user from index

    Args:
        user (User): A user to remove from index
    """
    _remove_user(user)
