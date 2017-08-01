"""
Tests for profile functions
"""

from unittest.mock import Mock
from backends.edxorg import EdxOrgOAuth2

from profiles.api import get_social_username, get_social_auth
from profiles.factories import SocialProfileFactory
from micromasters.factories import UserSocialAuthFactory
from search.base import MockedESTestCase


class SocialTests(MockedESTestCase):
    """
    Tests for profile functions
    """

    def setUp(self):
        """
        Create a user with a default social auth
        """
        super(SocialTests, self).setUp()

        profile = SocialProfileFactory.create(
            agreed_to_terms_of_service=True,
            filled_out=True,
        )
        self.user = profile.user
        UserSocialAuthFactory.create(user=self.user, provider='not_edx')

    def test_anonymous_user(self):
        """
        get_social_username should return None for anonymous users
        """
        is_anonymous = Mock(return_value=True)
        user = Mock(is_anonymous=is_anonymous)
        assert get_social_username(user) is None
        assert is_anonymous.called

    def test_zero_social(self):
        """
        get_social_username should return None if there is no edX account associated yet
        """
        self.user.social_auth.all().delete()
        assert get_social_username(self.user) is None

    def test_one_social(self):
        """
        get_social_username should return the social username, not the Django username
        """
        assert get_social_username(self.user) == self.user.social_auth.first().uid

    def test_two_social(self):
        """
        get_social_username should return latest social user name if
        there are two social edX accounts for a user
        """
        new_social_auth = UserSocialAuthFactory.create(user=self.user, uid='other name')
        assert get_social_username(self.user) == new_social_auth.uid

    def test_get_social_auth(self):
        """
        Tests that get_social_auth returns a user's edX social auth object, and if multiple edX social auth objects
        exists, it returns the most recently created
        """
        assert get_social_auth(self.user) == self.user.social_auth.get(provider=EdxOrgOAuth2.name)
        new_social_auth = UserSocialAuthFactory.create(user=self.user, uid='other name')
        assert get_social_auth(self.user) == new_social_auth
