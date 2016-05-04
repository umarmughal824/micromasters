"""
Tests for profile serializers
"""

from django.test import TestCase
from django.db.models.signals import post_save
from factory.django import mute_signals
from rest_framework.fields import DateTimeField
from rest_framework.exceptions import ValidationError

from profiles.factories import EmploymentFactory, ProfileFactory, UserFactory
from profiles.serializers import (
    EmploymentSerializer,
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
            'agreed_to_terms_of_service': profile.agreed_to_terms_of_service,
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
            'pretty_printed_student_id': profile.pretty_printed_student_id,
            'work_history': [
                EmploymentSerializer().to_representation(work_history) for work_history in
                profile.work_history.all()
            ]
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

    def test_add_employment(self):
        """
        Test that we handle adding an employment correctly
        """
        employment_object = {
            "city": "NY",
            "state_or_territory": "NY",
            "country": "USA",
            "company_name": "XYZ-ABC",
            "position": "SSE",
            "industry": "IT",
            "end_date": "2016-05-17",
            "start_date": "2016-05-28"
        }

        user1 = UserFactory.create()
        user2 = UserFactory.create()
        serializer = ProfileSerializer(instance=user1.profile, data={
            'work_history': [employment_object]
        })
        serializer.is_valid(raise_exception=True)
        serializer.save()

        assert user1.profile.work_history.count() == 1
        employment = user1.profile.work_history.first()
        employment_object['id'] = employment.id
        assert EmploymentSerializer().to_representation(employment) == employment_object

        # Other profile did not get the employment assigned to it
        assert user2.profile.work_history.count() == 0

    def test_update_employment(self):
        """
        Test that we handle updating an employment correctly
        """
        with mute_signals(post_save):
            employment = EmploymentFactory.create()
        employment_object = EmploymentSerializer().to_representation(employment)
        employment_object['position'] = "SE"

        serializer = ProfileSerializer(instance=employment.profile, data={
            'work_history': [employment_object]
        })
        serializer.is_valid(raise_exception=True)
        serializer.save()

        assert employment.profile.work_history.count() == 1
        employment = employment.profile.work_history.first()
        assert EmploymentSerializer().to_representation(employment) == employment_object

    def test_update_employment_different_profile(self):
        """
        Make sure we can't edit an employment for a different profile
        """
        with mute_signals(post_save):
            employment1 = EmploymentFactory.create()
            employment2 = EmploymentFactory.create()
        employment_object = EmploymentSerializer().to_representation(employment1)
        employment_object['id'] = employment2.id

        serializer = ProfileSerializer(instance=employment1.profile, data={
            'work_history': [employment_object]
        })
        serializer.is_valid(raise_exception=True)
        with self.assertRaises(ValidationError) as ex:
            serializer.save()
        assert ex.exception.detail == ["Work history {} does not exist".format(employment2.id)]

    def test_delete_employment(self):
        """
        Test that we delete employments which aren't specified in the PATCH
        """
        with mute_signals(post_save):
            employment1 = EmploymentFactory.create()
            EmploymentFactory.create(profile=employment1.profile)
            # has a different profile
            employment3 = EmploymentFactory.create()

        assert employment1.profile.work_history.count() == 2
        employment_object1 = EmploymentSerializer().to_representation(employment1)
        serializer = ProfileSerializer(instance=employment1.profile, data={
            'work_history': [employment_object1]
        })
        serializer.is_valid(raise_exception=True)
        serializer.save()

        assert employment1.profile.work_history.count() == 1
        assert employment1.profile.work_history.first() == employment1

        # Other profile is unaffected
        assert employment3.profile.work_history.count() == 1
