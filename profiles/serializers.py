"""
Serializers for user profiles
"""
from django.db import transaction

from rest_framework.exceptions import ValidationError
from rest_framework.serializers import ModelSerializer, SerializerMethodField, IntegerField

from profiles.models import Employment, Profile, Education


def update_work_history(work_history_list, profile_id):
    """
    Update employment history for given profile id.

    Args:
        work_history_list (list): List of work history dicts.
        profile_id (int): User profile id.
    """
    saved_work_history_ids = set()
    for work_history in work_history_list:
        work_history_id = work_history.get("id")
        work_history_instance = None
        if work_history_id:
            try:
                work_history_instance = Employment.objects.get(
                    profile_id=profile_id, id=work_history_id
                )
            except Employment.DoesNotExist:
                raise ValidationError("Work history {} does not exist".format(work_history_id))

        work_history_serializer = EmploymentSerializer(instance=work_history_instance, data=work_history)
        work_history_serializer.is_valid(raise_exception=True)
        work_history_serializer.save(profile_id=profile_id)
        saved_work_history_ids.add(work_history_serializer.instance.id)

    Employment.objects.filter(profile_id=profile_id).exclude(id__in=saved_work_history_ids).delete()


def update_education(education_list, profile_id):
    """
    Update education for given profile id.

    Args:
        education_list (list): List of education dicts.
        profile_id (int): User profile id.
    """
    saved_education_ids = set()
    for education in education_list:
        education_id = education.get("id")
        if education_id is not None:
            try:
                education_instance = Education.objects.get(profile_id=profile_id, id=education_id)
            except Education.DoesNotExist:
                raise ValidationError("Education {} does not exist".format(education_id))
        else:
            education_instance = None
        education_serializer = EducationSerializer(instance=education_instance, data=education)
        education_serializer.is_valid(raise_exception=True)
        education_serializer.save(profile_id=profile_id)
        saved_education_ids.add(education_serializer.instance.id)

    Education.objects.filter(profile_id=profile_id).exclude(id__in=saved_education_ids).delete()


class EmploymentSerializer(ModelSerializer):
    """Serializer for Employment objects"""
    id = IntegerField(required=False)  # override the read_only flag so we can edit it

    class Meta:
        model = Employment
        fields = (
            'id',
            'city',
            'state_or_territory',
            'country',
            'company_name',
            'position',
            'industry',
            'end_date',
            'start_date'
        )


class EducationSerializer(ModelSerializer):
    """Serializer for Education objects"""
    id = IntegerField(required=False)  # override the read_only flag so we can edit it

    class Meta:
        model = Education
        fields = (
            'id',
            'degree_name',
            'graduation_date',
            'field_of_study',
            'online_degree',
            'school_name',
            'school_city',
            'school_state_or_territory',
            'school_country')


class ProfileSerializer(ModelSerializer):
    """Serializer for Profile objects"""
    pretty_printed_student_id = SerializerMethodField()
    work_history = EmploymentSerializer(many=True)
    education = EducationSerializer(many=True)

    def get_pretty_printed_student_id(self, obj):
        """helper method for the SerializerMethodField"""
        # pylint: disable=no-self-use
        return obj.pretty_printed_student_id

    def update(self, instance, validated_data):
        with transaction.atomic():
            for attr, value in validated_data.items():
                if attr == 'work_history' or attr == 'education':
                    continue
                else:
                    setattr(instance, attr, value)
            instance.save()
            if 'work_history' in validated_data:
                update_work_history(validated_data['work_history'], instance.id)

            if 'education' in validated_data:
                update_education(validated_data['education'], instance.id)
            return instance

    class Meta:  # pylint: disable=missing-docstring
        model = Profile
        fields = (
            'filled_out',
            'agreed_to_terms_of_service',
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
            'pretty_printed_student_id',
            'work_history',
            'edx_level_of_education',
            'education'
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
