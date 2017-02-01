"""
Tests for exams API
"""
from django.test import (
    SimpleTestCase,
    override_settings,
)
from django.core.exceptions import ImproperlyConfigured

from exams.api import sso_digest


class SSODigestTests(SimpleTestCase):
    """
    Tests for the sso_digest helper function
    """

    @override_settings(
        EXAMS_SSO_PASSPHRASE="C is for cookie",
        EXAMS_SSO_CLIENT_CODE="and that's good enough for me",
    )
    def test_that_sso_digest_computes_correctly(self):
        """Verifies sso_digest computes correctly"""

        # computed "by hand"
        assert sso_digest(123, 1486069731, 1800) == (
            'a64ea7218e4a67d863e03ec43ac40240af39f5924af46e02b2199e3f7974b8d3'
        )

    @override_settings(EXAMS_SSO_PASSPHRASE=None)
    def test_that_no_passphrase_raises(self):
        """Verifies that if we don't set the passphrase we raise an exception"""
        with self.assertRaises(ImproperlyConfigured):
            sso_digest(123, 1486069731, 1800)

    @override_settings(EXAMS_SSO_CLIENT_CODE=None)
    def test_that_no_client_code_raises(self):
        """Verifies that if we don't set the passphrase we raise an exception"""
        with self.assertRaises(ImproperlyConfigured):
            sso_digest(123, 1486069731, 1800)
