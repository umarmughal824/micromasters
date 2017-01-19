"""Tests for Pearson utils"""
from unittest.mock import patch

from django.test import SimpleTestCase

from exams.pearson import utils


class PearsonUtilsTest(SimpleTestCase):
    """Tests for Pearson utils"""
    def test_is_zip_file(self):  # pylint: disable=no-self-use
        """Tests is_zip_file"""
        assert utils.is_zip_file('file.zip') is True
        assert utils.is_zip_file('file.not') is False
        assert utils.is_zip_file('file') is False

    def test_get_file_type(self):  # pylint: disable=no-self-use
        """Tests get_file_type"""
        assert utils.get_file_type('vcdc-2016-02-08-a.dat') == 'vcdc'
        assert utils.get_file_type('eac-2016-02-08-a.dat') == 'eac'
        assert utils.get_file_type('eac-2016-02-08-a.not') is None
        assert utils.get_file_type('asdfsad-2016-02-08-a.dat') is None

    @patch('mail.api.MailgunClient')
    def test_email_processing_failures(self, mailgun_client_mock):  # pylint: disable=no-self-use
        """Test email_processing_failures for correct calls and formatting"""

        with self.settings(ADMIN_EMAIL='admin@example.com'):
            utils.email_processing_failures('b.dat', 'a.zip', [
                'ERROR',
                'ERROR2',
            ])

        client_instance = mailgun_client_mock.return_value
        client_instance.send_individual_email.assert_called_once_with(
            "Summary of failures of Pearson file='b.dat'",
            "Hi,\nThe following errors were found in the "
            "file b.dat in a.zip:\n\n"
            "- ERROR\n- ERROR2",
            "admin@example.com"
        )
