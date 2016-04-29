"""
Test end to end django views.
"""
from django.db.models.signals import post_save
from django.test import TestCase
from django.test.client import Client
from factory.django import mute_signals
from factory.fuzzy import FuzzyText

from courses.factories import ProgramFactory
from profiles.factories import ProfileFactory, UserFactory
from ui.urls import DASHBOARD_URL


class TestViews(TestCase):
    """
    Test that the views work as expected.
    """
    def setUp(self):
        """Common test setup"""
        super(TestViews, self).setUp()
        self.client = Client()

    def test_program_liveness(self):
        """Verify only 'live' program visible on homepage"""
        program_live_true = ProgramFactory.create(live=True)
        program_live_false = ProgramFactory.create(live=False)
        response = self.client.get('/')
        self.assertContains(
            response,
            program_live_true.title,
            status_code=200
        )
        self.assertNotContains(
            response,
            program_live_false.title,
            status_code=200
        )

    def test_dashboard_settings(self):
        """
        Assert settings we pass to dashboard
        """
        with mute_signals(post_save):
            profile = ProfileFactory.create(
                agreed_to_terms_of_service=True
            )
        self.client.force_login(profile.user)

        ga_tracking_id = FuzzyText().fuzz()
        react_ga_debug = FuzzyText().fuzz()
        edx_base_url = FuzzyText().fuzz()
        with self.settings(
            GA_TRACKING_ID=ga_tracking_id,
            REACT_GA_DEBUG=react_ga_debug,
            EDXORG_BASE_URL=edx_base_url
        ):
            resp = self.client.get(DASHBOARD_URL)
            self.assertContains(resp, ga_tracking_id)
            self.assertContains(resp, react_ga_debug)
            self.assertContains(resp, edx_base_url)
            self.assertContains(resp, profile.preferred_name)
            self.assertContains(resp, profile.user.username)

    def test_unauthenticated_user_redirect(self):
        """Verify that an unauthenticated user can't visit '/dashboard'"""
        response = self.client.get(DASHBOARD_URL)
        self.assertRedirects(
            response,
            "/?next={}".format(DASHBOARD_URL)
        )

    def test_authenticated_user_doesnt_redirect(self):
        """Verify that we let an authenticated user through to '/dashboard'"""
        with mute_signals(post_save):
            user = UserFactory.create()
            ProfileFactory.create(user=user, agreed_to_terms_of_service=True)
        self.client.force_login(user)
        response = self.client.get(DASHBOARD_URL)
        self.assertContains(
            response,
            "Micromasters",
            status_code=200
        )

    def test_webpack_url(self):
        """Verify that webpack bundle src shows up in production"""
        for debug, expected_url in [
                (True, "foo_server/style.js"),
                (False, "bundles/style.js")
        ]:
            with self.settings(
                DEBUG=debug,
                USE_WEBPACK_DEV_SERVER=True,
                WEBPACK_SERVER_URL="foo_server"
            ):
                response = self.client.get('/')
                self.assertContains(
                    response,
                    expected_url,
                    status_code=200
                )
