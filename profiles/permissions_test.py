"""
Tests for profile permissions
"""

from mock import Mock
from django.db.models.signals import post_save
from django.test import TestCase
from factory.django import mute_signals

from profiles.factories import ProfileFactory, UserFactory
from profiles.permissions import CanEditIfOwner


# pylint: disable=no-self-use
class CanEditIfOwnerTests(TestCase):
    """
    Tests for CanEditIfOwner permissions
    """

    def test_allow_nonedit(self):
        """
        Users are allowed to use safe methods without owning the profile.
        """
        perm = CanEditIfOwner()
        for method in ('GET', 'HEAD', 'OPTIONS'):
            request = Mock(method=method)
            with mute_signals(post_save):
                profile = ProfileFactory.create()
            assert perm.has_object_permission(request, None, profile)

    def test_edit_if_owner(self):
        """
        Users are allowed to edit their own profile
        """
        perm = CanEditIfOwner()
        for method in ('POST', 'PATCH', 'PUT'):
            with mute_signals(post_save):
                profile = ProfileFactory.create()
            request = Mock(method=method, user=profile.user)
            assert perm.has_object_permission(request, None, profile)

    def test_cant_edit_if_not_owner(self):
        """
        Users are not allowed to edit if it's not their profile.
        """
        perm = CanEditIfOwner()
        other_user = UserFactory.create()
        for method in ('POST', 'PATCH', 'PUT'):
            with mute_signals(post_save):
                profile = ProfileFactory.create()
            request = Mock(method=method, user=other_user)
            assert not perm.has_object_permission(request, None, profile)
