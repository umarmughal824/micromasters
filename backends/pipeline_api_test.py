"""
Tests for the pipeline APIs
"""

from urllib.parse import urljoin

from django.test import TestCase
import mock

from backends import pipeline_api, edxorg
from .pipeline_api import update_from_linkedin
from profiles.models import Profile
from profiles.factories import UserFactory


# pylint: disable=no-self-use
class EdxPipelineApiTest(TestCase):
    """
    Test class for APIs run during the Python Social Auth
    authentication pipeline.
    """

    def check_profile_fields(self, profile, profile_fields=None):
        """
        Helper function that checks if a profile is empty
        """
        all_empty_fields = [
            ('account_privacy', Profile.PRIVATE),
            ('name', None),
            ('bio', None),
            ('country', None),
            ('has_profile_image', False),
            ('profile_url_full', None),
            ('profile_url_large', None),
            ('profile_url_medium', None),
            ('profile_url_small', None),
            ('requires_parental_consent', None),
            ('year_of_birth', None),
            ('level_of_education', None),
            ('goals', None),
            ('language_proficiencies', None),
            ('gender', None),
            ('mailing_address', None),
        ]
        profile_fields = profile_fields or all_empty_fields
        profile.refresh_from_db()
        for key, val in profile_fields:
            assert getattr(profile, key) == val

    def setUp(self):
        """
        Set up class
        """
        self.user = UserFactory()
        self.user_profile = Profile.objects.get(user=self.user)

    def test_update_profile_wrong_backend(self):
        """
        The only backend allowed for update_profile is edxorg
        """
        self.check_profile_fields(self.user_profile)

        backend = mock.MagicMock(name='other_backend')
        pipeline_api.update_profile_from_edx(
            backend, self.user, {'access_token': 'foo'}, True)

        self.user_profile.refresh_from_db()
        self.check_profile_fields(self.user_profile)

    def test_update_profile_old_user(self):
        """
        Only new users are updated
        """
        self.check_profile_fields(self.user_profile)
        pipeline_api.update_profile_from_edx(
            edxorg.EdxOrgOAuth2, self.user, {'access_token': 'foo'}, False)

        self.user_profile.refresh_from_db()
        self.check_profile_fields(self.user_profile)

    def test_update_profile_no_access_token(self):
        """
        The response dict has no access token
        """
        self.check_profile_fields(self.user_profile)

        pipeline_api.update_profile_from_edx(
            edxorg.EdxOrgOAuth2, self.user, {'access_token': ''}, True)

        self.user_profile.refresh_from_db()
        self.check_profile_fields(self.user_profile)

    def test_update_profile_no_existing_profile(self):
        """
        The profile did not exist for the user
        """
        self.user_profile.delete()

        with self.assertRaises(Profile.DoesNotExist):
            Profile.objects.get(user=self.user)

        # just checking that nothing raises an exception
        pipeline_api.update_profile_from_edx(
            edxorg.EdxOrgOAuth2, self.user, {'access_token': 'foo_token'}, True)

        # verify that a profile has not been created
        with self.assertRaises(Profile.DoesNotExist):
            Profile.objects.get(user=self.user)

    @mock.patch('backends.edxorg.EdxOrgOAuth2.get_json')
    def test_update_profile(self, mocked_get_json):
        """
        Happy path
        """
        mocked_content = {
            'account_privacy': 'all_users',
            'bio': 'this is my personal profile text',
            'country': 'IT',
            'date_joined': '2016-03-17T20:37:51Z',
            'email': 'dummy.user@example.com',
            'gender': 'f',
            'goals': None,
            'is_active': True,
            'language_proficiencies': [{'code': 'it'}],
            'level_of_education': 'p',
            'mailing_address': None,
            'name': 'dummy user',
            'profile_image': {
                'has_image': True,
                'image_url_full': 'https://edx.org/full.jpg',
                'image_url_large': 'https://edx.org/large.jpg',
                'image_url_medium': 'https://edx.org/medium.jpg',
                'image_url_small': 'https://edx.org/small.jpg'
            },
            'requires_parental_consent': False,
            'username': self.user.username,
            'year_of_birth': 1986
        }
        mocked_get_json.return_value = mocked_content
        pipeline_api.update_profile_from_edx(
            edxorg.EdxOrgOAuth2, self.user, {'access_token': 'foo_token'}, True)
        mocked_get_json.assert_called_once_with(
            urljoin(
                edxorg.EdxOrgOAuth2.EDXORG_BASE_URL,
                '/api/user/v1/accounts/{0}'.format(self.user.username)
            ),
            headers={'Authorization': 'Bearer foo_token'}
        )

        all_fields = [
            ('account_privacy', mocked_content['account_privacy']),
            ('name', mocked_content['name']),
            ('bio', mocked_content['bio']),
            ('country', mocked_content['country']),
            ('has_profile_image', mocked_content['profile_image']['has_image']),
            ('profile_url_full', mocked_content['profile_image']['image_url_full']),
            ('profile_url_large', mocked_content['profile_image']['image_url_large']),
            ('profile_url_medium', mocked_content['profile_image']['image_url_medium']),
            ('profile_url_small', mocked_content['profile_image']['image_url_small']),
            ('requires_parental_consent', mocked_content['requires_parental_consent']),
            ('year_of_birth', mocked_content['year_of_birth']),
            ('level_of_education', mocked_content['level_of_education']),
            ('goals', mocked_content['goals']),
            ('language_proficiencies', mocked_content['language_proficiencies']),
            ('gender', mocked_content['gender']),
            ('mailing_address', mocked_content['mailing_address']),
        ]

        self.check_profile_fields(self.user_profile, all_fields)


class LinkedInPipelineTests(TestCase):
    """Tests for the LinkedIn pipline entry"""

    def test_saves_linkedin_response(self):
        """Happy path"""
        backend = mock.Mock()
        backend.name = 'linkedin-oauth2'
        user = UserFactory.create()
        response = {'test': 'works'}
        update_from_linkedin(backend, user, response)

        profile = Profile.objects.get(user=user)
        assert profile.linkedin == {'test': 'works'}
