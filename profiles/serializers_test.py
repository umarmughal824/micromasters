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
            'name': profile.name,
            'date_joined_micromasters': DateTimeField().to_representation(profile.date_joined_micromasters),
            'email_optin': profile.email_optin,
            'gender': profile.gender,
            'goals': profile.goals,
            'language_proficiencies': profile.language_proficiencies,
            'level_of_education': profile.level_of_education,
            'mailing_address': profile.mailing_address,
            'requires_parental_consent': profile.requires_parental_consent,
            'year_of_birth': profile.year_of_birth,
            'account_privacy': profile.account_privacy,
            'has_profile_image': profile.has_profile_image,
            'profile_url_full': profile.profile_url_full,
            'profile_url_large': profile.profile_url_large,
            'profile_url_medium': profile.profile_url_medium,
            'profile_url_small': profile.profile_url_small,
            'bio': profile.bio,
            'country': profile.country,
            'state_or_territory': profile.state_or_territory,
            'employer': profile.employer,
            'job_title': profile.job_title,
        }

    def test_limited(self):  # pylint: disable=no-self-use
        """
        Test limited serializer
        """
        profile = ProfileFactory.build()
        assert ProfileLimitedSerializer().to_representation(profile) == {
            'name': profile.name,
            'account_privacy': profile.account_privacy,
            'has_profile_image': profile.has_profile_image,
            'profile_url_full': profile.profile_url_full,
            'profile_url_large': profile.profile_url_large,
            'profile_url_medium': profile.profile_url_medium,
            'profile_url_small': profile.profile_url_small,
            'bio': profile.bio,
            'country': profile.country,
            'state_or_territory': profile.state_or_territory,
            'employer': profile.employer,
            'job_title': profile.job_title,
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
