"""
Tests for profile serializers
"""

from unittest import TestCase

from rest_framework.fields import DateTimeField

from profiles.factories import ProfileFactory
from profiles.serializers import (
    ProfileLimitedSerializer,
    ProfilePrivateSerializer,
    ProfileSerializer,
)


# pylint: disable=no-self-use
class ProfileTests(TestCase):
    """
    Tests for profile serializers
    """

    def test_full(self):  # pylint: disable=no-self-use
        """
        Test full serializer
        """
        profile = ProfileFactory.build()
        assert ProfileSerializer().to_representation(profile) == {
            'first_name': profile.first_name,
            'filled_out': profile.filled_out,
            'last_name': profile.last_name,
            'preferred_name': profile.preferred_name,
            'email_optin': profile.email_optin,
            'gender': profile.gender,
            'date_of_birth': DateTimeField().to_representation(profile.date_of_birth),
            'account_privacy': profile.account_privacy,
            'has_profile_image': profile.has_profile_image,
            'profile_url_full': profile.profile_url_full,
            'profile_url_large': profile.profile_url_large,
            'profile_url_medium': profile.profile_url_medium,
            'profile_url_small': profile.profile_url_small,
            'country': profile.country,
            'state_or_territory': profile.state_or_territory,
            'city': profile.city,
            'birth_country': profile.birth_country,
            'birth_state_or_territory': profile.birth_state_or_territory,
            'birth_city': profile.birth_city,
            'preferred_language': profile.preferred_language,
            'pretty_printed_student_id': profile.pretty_printed_student_id
        }

    def test_limited(self):  # pylint: disable=no-self-use
        """
        Test limited serializer
        """
        profile = ProfileFactory.build()
        assert ProfileLimitedSerializer().to_representation(profile) == {
            'preferred_name': profile.preferred_name,
            'account_privacy': profile.account_privacy,
            'has_profile_image': profile.has_profile_image,
            'profile_url_full': profile.profile_url_full,
            'profile_url_large': profile.profile_url_large,
            'profile_url_medium': profile.profile_url_medium,
            'profile_url_small': profile.profile_url_small,
            'city': profile.city,
            'country': profile.country,
            'state_or_territory': profile.state_or_territory,
        }

    def test_private(self):  # pylint: disable=no-self-use
        """
        Test private serializer
        """
        profile = ProfileFactory.build()
        assert ProfilePrivateSerializer().to_representation(profile) == {
            'account_privacy': profile.account_privacy,
            'has_profile_image': profile.has_profile_image,
            'profile_url_full': profile.profile_url_full,
            'profile_url_large': profile.profile_url_large,
            'profile_url_medium': profile.profile_url_medium,
            'profile_url_small': profile.profile_url_small,
        }

    def test_readonly(self):
        """
        Test that certain fields cannot be altered
        """
        assert ProfileSerializer.Meta.read_only_fields == ('filled_out',)
