"""
Serializers for user profiles
"""
from rest_framework.serializers import ModelSerializer

from profiles.models import Profile


class ProfileSerializer(ModelSerializer):
    """Serializer for Profile objects"""

    class Meta:  # pylint: disable=missing-docstring
        model = Profile
        fields = (
            'filled_out',
            'account_privacy',
            'email_optin',
            'first_name',
            'last_name',
            'preferred_name',
            'country',
            'state_or_territory',
            'city',
            'birth_country',
            'birth_state_or_territory',
            'birth_city',
            'has_profile_image',
            'profile_url_full',
            'profile_url_large',
            'profile_url_medium',
            'profile_url_small',
            'date_of_birth',
            'preferred_language',
            'gender',
        )
        read_only_fields = (
            'filled_out',
        )


class ProfileLimitedSerializer(ModelSerializer):
    """
    Serializer for Profile objects, limited to fields that other users are
    allowed to see if a profile is marked public.
    """
    class Meta:  # pylint: disable=missing-docstring
        model = Profile
        fields = (
            'preferred_name',
            'account_privacy',
            'country',
            'state_or_territory',
            'city',
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
