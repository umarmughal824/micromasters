"""
Serializers for user profiles
"""
from rest_framework.fields import JSONField
from rest_framework.serializers import ModelSerializer

from profiles.models import Profile


class ProfileSerializer(ModelSerializer):
    """Serializer for Profile objects"""
    language_proficiencies = JSONField()

    class Meta:  # pylint: disable=missing-docstring
        model = Profile
        fields = (
            'account_privacy',
            'email_optin',
            'employer',
            'job_title',
            'state_or_territory',
            'name',
            'bio',
            'country',
            'has_profile_image',
            'profile_url_full',
            'profile_url_large',
            'profile_url_medium',
            'profile_url_small',
            'requires_parental_consent',
            'year_of_birth',
            'level_of_education',
            'goals',
            'language_proficiencies',
            'gender',
            'mailing_address',
            'date_joined_micromasters',
        )


class ProfileLimitedSerializer(ModelSerializer):
    """
    Serializer for Profile objects, limited to fields that other users are
    allowed to see if a profile is marked public.
    """
    class Meta:  # pylint: disable=missing-docstring
        model = Profile
        fields = (
            'name',
            'bio',
            'account_privacy',
            'employer',
            'job_title',
            'state_or_territory',
            'country',
            'has_profile_image',
            'profile_url_full',
            'profile_url_large',
            'profile_url_medium',
            'profile_url_small',
        )


class ProfilePrivateSerializer(ModelSerializer):
    """
    Serializer for Profile objects, limited to fields that other users are
    allowed to see if a profile is marked private.
    """
    class Meta:  # pylint: disable=missing-docstring
        model = Profile
        fields = (
            'account_privacy',
            'has_profile_image',
            'profile_url_full',
            'profile_url_large',
            'profile_url_medium',
            'profile_url_small',
        )
