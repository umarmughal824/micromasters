"""Pearson SFTP download tests"""
from datetime import datetime
from unittest.mock import (
    MagicMock,
    Mock,
    call,
    mock_open,
    patch
)

import ddt
import pytz
from factory.django import mute_signals
from django.db.models.signals import post_save
from django.test import (
    override_settings,
    SimpleTestCase,
)
from paramiko import SSHException

from courses.factories import CourseFactory
from exams.factories import (
    ExamAuthorizationFactory,
    ExamProfileFactory,
)
from exams.models import (
    ExamAuthorization,
    ExamProfile,
)
from exams.pearson.constants import (
    EAC_SUCCESS_STATUS,
    EAC_FAILURE_STATUS,
    VCDC_SUCCESS_STATUS,
    VCDC_FAILURE_STATUS,
)
from exams.pearson import download
from exams.pearson.exceptions import RetryableSFTPException
from exams.pearson.readers import (
    EACResult,
    VCDCResult,
)
from exams.pearson.sftp_test import EXAMS_SFTP_SETTINGS
from search.base import MockedESTestCase

FIXED_DATETIME = datetime(2016, 5, 15, 15, 2, 55, tzinfo=pytz.UTC)


# pylint: disable=too-many-arguments
@ddt.ddt
@override_settings(**EXAMS_SFTP_SETTINGS)
class PearsonDownloadTest(SimpleTestCase):
    """
    Tests for non-connection Pearson download code
    """
    def setUp(self):
        self.sftp = Mock()

    def test_fetch_file(self):
        """
        Tests that fetch_file works as expected
        """
        remote_path = 'file.ext'
        expected_local_path = '/tmp/file.ext'
        processor = download.ArchivedResponseProcessor(self.sftp)

        local_path = processor.fetch_file(remote_path)

        assert local_path == expected_local_path
        self.sftp.get.assert_called_once_with(remote_path, localpath=expected_local_path)

    def test_filtered_files(self):
        """
        Test that filtered_files filters on the regex
        """
        listdir_values = ['a.zip', 'b.zip', 'b']
        isfile_values = [True, False, True]
        self.sftp.listdir.return_value = listdir_values
        self.sftp.isfile.side_effect = isfile_values
        processor = download.ArchivedResponseProcessor(self.sftp)

        result = list(processor.filtered_files())

        assert result == [('a.zip', '/tmp/a.zip')]

        self.sftp.listdir.assert_called_once_with()
        assert self.sftp.isfile.call_args_list == [call(arg) for arg in listdir_values]

    @patch('exams.pearson.utils.get_file_type')
    @patch('exams.pearson.download.ArchivedResponseProcessor.process_eac_file')
    @patch('exams.pearson.download.ArchivedResponseProcessor.process_vcdc_file')
    def test_process_extracted_file(self, process_vcdc_file_mock, process_eac_file_mock, get_file_type_mock):
        """
        Test that process_extracted_file handles file types correctly
        """
        extracted_file = Mock()
        process_eac_file_mock.return_value = (True, ['EAC'])
        process_vcdc_file_mock.return_value = (True, ['VCDC'])
        processor = download.ArchivedResponseProcessor(self.sftp)

        get_file_type_mock.return_value = 'eac'
        assert processor.process_extracted_file(extracted_file, '') == process_eac_file_mock.return_value
        processor.process_eac_file.assert_called_once_with(extracted_file)

        get_file_type_mock.return_value = 'vcdc'
        assert processor.process_extracted_file(extracted_file, '') == process_vcdc_file_mock.return_value
        processor.process_vcdc_file.assert_called_once_with(extracted_file)

        get_file_type_mock.return_value = None
        assert processor.process_extracted_file(extracted_file, '') == (False, [])

    @ddt.data(
        (['a.file', 'b.file'], [(True, []), (True, [])], True),
        (['a.file', 'b.file'], [(True, []), (False, [])], False),
        (['a.file', 'b.file'], [(False, []), (True, [])], False),
        (['a.file', 'b.file'], [(False, []), (False, [])], False),
    )
    @ddt.unpack
    @patch('zipfile.ZipFile', spec=True)
    @patch('exams.pearson.download.ArchivedResponseProcessor.process_extracted_file')
    def test_process_zip(self, files, results, expected_result, process_extracted_file_mock, zip_file_mock):
        """Tests that process_zip behaves correctly"""
        process_extracted_file_mock.side_effect = results
        zip_file_mock.return_value.__enter__.return_value.namelist.return_value = files

        processor = download.ArchivedResponseProcessor(self.sftp)
        with patch(
            'exams.pearson.utils.email_processing_failures'
        ) as email_processing_failures_mock, patch(
            'exams.pearson.download.locally_extracted'
        ) as locally_extracted_mock:
            locally_extracted_mock.__enter__.return_value = []
            assert processor.process_zip('local.zip') == expected_result

        email_processing_failures_mock.assert_not_called()

    @patch('zipfile.ZipFile', spec=True)
    @patch('exams.pearson.download.ArchivedResponseProcessor.process_extracted_file')
    def test_process_zip_email(self, process_extracted_file_mock, zip_file_mock):  # pylint: disable=no-self-use
        """Tests that an email is sent if errors returned"""
        process_extracted_file_mock.return_value = (True, ['ERROR'])
        zip_file_mock.return_value.__enter__.return_value.namelist.return_value = ['a.dat']

        processor = download.ArchivedResponseProcessor(self.sftp)
        with patch('exams.pearson.utils.email_processing_failures') as email_processing_failures_mock:
            processor.process_zip('local.zip')

        email_processing_failures_mock.assert_called_once_with('a.dat', 'local.zip', ['ERROR'])

    @ddt.data(
        (True, 1),
        (False, 0),
    )
    @ddt.unpack
    @patch('os.path.exists')
    @patch('os.remove')
    def test_locally_extracted(self, exists, remove_count, remove_mock, exists_mock):
        """
        Tests that the local file gets removed on error if it exists
        """
        zip_mock = Mock(return_value='path')
        exists_mock.return_value = exists
        with patch('exams.pearson.download.open', mock_open(), create=True) as open_mock:
            open_mock.side_effect = Exception('exception')
            with self.assertRaises(Exception):
                with download.locally_extracted(zip_mock, 'file'):
                    pass
            open_mock.assert_called_once_with(zip_mock.extract.return_value, 'r')

        exists_mock.assert_called_once_with(zip_mock.extract.return_value)

        assert remove_mock.call_count == remove_count


@override_settings(**EXAMS_SFTP_SETTINGS)
@ddt.ddt
@patch('os.remove')
@patch('os.path.exists', return_value=True)
@patch(
    'exams.pearson.download.ArchivedResponseProcessor.filtered_files',
    return_value=[
        ('a.zip', '/tmp/a.zip'),
    ]
)
@patch('exams.pearson.download.ArchivedResponseProcessor.process_zip', return_value=True)
class ArchivedResponseProcessorProcessTest(SimpleTestCase):
    """Tests around ArchivedResponseProcessor.process"""
    def setUp(self):
        self.sftp = MagicMock()

    def test_process_success(self, process_zip_mock, filtered_files_mock, os_path_exists_mock, os_remove_mock):
        """Test the happy path"""
        processor = download.ArchivedResponseProcessor(self.sftp)
        processor.process()

        filtered_files_mock.assert_called_once_with()
        self.sftp.remove.assert_called_once_with('a.zip')
        process_zip_mock.assert_called_once_with('/tmp/a.zip')
        os_path_exists_mock.assert_called_once_with('/tmp/a.zip')
        os_remove_mock.assert_called_once_with('/tmp/a.zip')

    def test_process_failure(self, process_zip_mock, filtered_files_mock, os_path_exists_mock, os_remove_mock):
        """Test the unhappy path"""
        process_zip_mock.return_value = False
        processor = download.ArchivedResponseProcessor(self.sftp)
        processor.process()

        filtered_files_mock.assert_called_once_with()
        self.sftp.remove.assert_not_called()
        process_zip_mock.assert_called_once_with('/tmp/a.zip')
        os_path_exists_mock.assert_called_once_with('/tmp/a.zip')
        os_remove_mock.assert_called_once_with('/tmp/a.zip')

    def test_process_exception(self, process_zip_mock, filtered_files_mock, os_path_exists_mock, os_remove_mock):
        """Test that process() cleans up the local but not the remote on any processing exception"""
        process_zip_mock.side_effect = Exception('exception')

        processor = download.ArchivedResponseProcessor(self.sftp)
        processor.process()

        filtered_files_mock.assert_called_once_with()
        self.sftp.remove.assert_not_called()
        process_zip_mock.assert_called_once_with('/tmp/a.zip')
        os_path_exists_mock.assert_called_once_with('/tmp/a.zip')
        os_remove_mock.assert_called_once_with('/tmp/a.zip')

    @ddt.data(
        SSHException('exception'),
        EOFError(),
    )
    def test_process_ssh_exception_remove(
            self, exc, process_zip_mock, filtered_files_mock, os_path_exists_mock, os_remove_mock):
        """Test that SSH exceptions bubble up"""
        self.sftp.remove.side_effect = exc

        processor = download.ArchivedResponseProcessor(self.sftp)
        with self.assertRaises(RetryableSFTPException):
            processor.process()

        filtered_files_mock.assert_called_once_with()
        self.sftp.remove.assert_called_once_with('a.zip')
        process_zip_mock.assert_called_once_with('/tmp/a.zip')
        os_path_exists_mock.assert_called_once_with('/tmp/a.zip')
        os_remove_mock.assert_called_once_with('/tmp/a.zip')

    def test_process_ssh_exception_cd(
            self, process_zip_mock, filtered_files_mock, os_path_exists_mock, os_remove_mock):
        """Test that SSH exceptions bubble up"""
        self.sftp.cd.side_effect = SSHException('exception')

        processor = download.ArchivedResponseProcessor(self.sftp)
        with self.assertRaises(RetryableSFTPException):
            processor.process()

        filtered_files_mock.assert_not_called()
        self.sftp.remove.assert_not_called()
        process_zip_mock.assert_not_called()
        os_path_exists_mock.assert_not_called()
        os_remove_mock.assert_not_called()

    def test_process_missing_local(self, process_zip_mock, filtered_files_mock, os_path_exists_mock, os_remove_mock):
        """Test that a missing local file doesn't fail"""
        os_path_exists_mock.return_value = False

        processor = download.ArchivedResponseProcessor(self.sftp)
        processor.process()

        filtered_files_mock.assert_called_once_with()
        self.sftp.remove.assert_called_once_with('a.zip')
        process_zip_mock.assert_called_once_with('/tmp/a.zip')
        os_path_exists_mock.assert_called_once_with('/tmp/a.zip')
        os_remove_mock.assert_not_called()


@override_settings(**EXAMS_SFTP_SETTINGS)
@ddt.ddt
class VCDCDownloadTest(MockedESTestCase):
    """
    Test for Vue Candidate Data Confirmation files (VCDC) files processing.
    """
    @classmethod
    def setUpTestData(cls):
        sftp = Mock()
        cls.now = datetime.now(pytz.utc)
        cls.processor = download.ArchivedResponseProcessor(sftp)
        with mute_signals(post_save):
            cls.success_profiles = ExamProfileFactory.create_batch(2) + [
                ExamProfileFactory.create(profile__id=999, profile__student_id=1000),  # disjoint id and student_id
            ]
            cls.failure_profiles = ExamProfileFactory.create_batch(2)

        cls.success_results = [VCDCResult(
            client_candidate_id=exam_profile.profile.student_id,
            status=VCDC_SUCCESS_STATUS,
            date=cls.now,
            message='',
        ) for exam_profile in cls.success_profiles]
        cls.failed_results = [
            VCDCResult(
                client_candidate_id=cls.failure_profiles[0].profile.student_id,
                status=VCDC_FAILURE_STATUS,
                date=cls.now,
                message='',
            ),
            VCDCResult(
                client_candidate_id=cls.failure_profiles[1].profile.student_id,
                status=VCDC_FAILURE_STATUS,
                date=cls.now,
                message='Bad address',
            ),
        ]

        cls.all_results = cls.success_results + cls.failed_results

    def test_process_result_vcdc(self):
        """
        Test file processing, happy case.
        """

        with patch('exams.pearson.download.VCDCReader.read', return_value=self.success_results):
            assert self.processor.process_vcdc_file("/tmp/file.ext") == (True, [])

            for profile in self.success_profiles:
                profile.refresh_from_db()
                assert profile.status == ExamProfile.PROFILE_SUCCESS

    def test_process_result_vcdc_when_error(self):
        """
        Test situation where we get failure results back
        """

        with patch('exams.pearson.download.VCDCReader.read', return_value=self.all_results):
            assert self.processor.process_vcdc_file("/tmp/file.ext") == (
                True,
                [
                    "ExamProfile sync failed for user `{username}`.".format(
                        username=self.failure_profiles[0].profile.user.username),
                    "ExamProfile sync failed for user `{username}`. Received error: 'Bad address'.".format(
                        username=self.failure_profiles[1].profile.user.username),
                ]
            )
            for profile in self.success_profiles:
                profile.refresh_from_db()
                assert profile.status == ExamProfile.PROFILE_SUCCESS

            for profile in self.failure_profiles:
                profile.refresh_from_db()
                assert profile.status == ExamProfile.PROFILE_FAILED

    def test_process_result_vcdc_when_invalid_data_in_file(self):
        """Tests for the situation where we don't have a matching record"""
        results = [
            VCDCResult(
                client_candidate_id=10,
                status=VCDC_SUCCESS_STATUS,
                date=self.now,
                message=''
            ),
            VCDCResult(
                client_candidate_id=11,
                status=VCDC_FAILURE_STATUS,
                date=self.now,
                message='Invalid address'
            )
        ]

        with patch('exams.pearson.download.VCDCReader.read', return_value=results):
            assert self.processor.process_vcdc_file("/tmp/file.ext") == (
                True,
                [
                    'Unable to find an ExamProfile record for profile_id `10`',
                    'Unable to find an ExamProfile record for profile_id `11`',
                ]
            )


@override_settings(**EXAMS_SFTP_SETTINGS)
@ddt.ddt
class EACDownloadTest(MockedESTestCase):
    """
    Test for Exam Authorization Confirmation files (EAC) files processing.
    """
    @classmethod
    def setUpTestData(cls):
        sftp = Mock()
        cls.processor = download.ArchivedResponseProcessor(sftp)
        cls.course = course = CourseFactory.create()
        cls.success_auths = ExamAuthorizationFactory.create_batch(2, course=course)
        cls.failure_auths = ExamAuthorizationFactory.create_batch(2, course=course)

        cls.success_results = [EACResult(
            exam_authorization_id=auth.id,
            candidate_id=auth.user.profile.student_id,
            date=FIXED_DATETIME,
            status=EAC_SUCCESS_STATUS,
            message='',
        ) for auth in cls.success_auths]
        cls.failed_results = [
            EACResult(
                exam_authorization_id=cls.failure_auths[0].id,
                candidate_id=cls.failure_auths[0].user.profile.student_id,
                date=FIXED_DATETIME,
                status=EAC_FAILURE_STATUS,
                message='',
            ),
            EACResult(
                exam_authorization_id=cls.failure_auths[1].id,
                candidate_id=cls.failure_auths[1].user.profile.student_id,
                date=FIXED_DATETIME,
                status=EAC_FAILURE_STATUS,
                message='wrong username',
            ),
        ]

        cls.all_results = cls.success_results + cls.failed_results

    def test_process_result_eac(self):
        """
        Test Exam Authorization Confirmation files (EAC) file processing, happy case.
        """

        with patch('exams.pearson.download.EACReader.read', return_value=self.success_results):
            assert self.processor.process_eac_file("/tmp/file.ext") == (True, [])

            for auth in self.success_auths:
                auth.refresh_from_db()
                assert auth.status == ExamAuthorization.STATUS_SUCCESS

    def test_process_result_eac_when_error(self):
        """
        Test Exam Authorization Confirmation files (EAC) file processing, failure case.
        """

        with patch('exams.pearson.download.EACReader.read', return_value=self.all_results):
            assert self.processor.process_eac_file("/tmp/file.ext") == (
                True,
                [
                    "Exam authorization failed for user `{username}` with authorization "
                    "id `{auth_id}`. ".format(
                        username=self.failure_auths[0].user.username,
                        auth_id=self.failure_auths[0].id
                    ),
                    "Exam authorization failed for user `{username}` with authorization id `{auth_id}`. "
                    "Received error: 'wrong username'.".format(
                        username=self.failure_auths[1].user.username,
                        auth_id=self.failure_auths[1].id
                    )
                ]
            )
            for auth in self.success_auths:
                auth.refresh_from_db()
                assert auth.status == ExamAuthorization.STATUS_SUCCESS

            for auth in self.failure_auths:
                auth.refresh_from_db()
                assert auth.status == ExamAuthorization.STATUS_FAILED

    def test_process_result_eac_when_invalid_data_in_file(self):
        """
        Test Exam Authorization Confirmation files (EAC) file processing, when this is
        record in EAC corresponding to which there in no record in ExamAuthorization model.
        """
        results = [
            EACResult(
                exam_authorization_id=10,
                candidate_id=10,
                date=FIXED_DATETIME,
                status=EAC_SUCCESS_STATUS,
                message=''
            ),
            EACResult(
                exam_authorization_id=11,
                candidate_id=11,
                date=FIXED_DATETIME,
                status=EAC_FAILURE_STATUS,
                message='wrong user name'
            )
        ]

        with patch('exams.pearson.download.EACReader.read', return_value=results):
            assert self.processor.process_eac_file("/tmp/file.ext") == (
                True,
                [
                    "Unable to find information for authorization_id: `10` and candidate_id: `10` "
                    "in our system.",
                    "Unable to find information for authorization_id: `11` and candidate_id: `11` "
                    "in our system."
                ]
            )
