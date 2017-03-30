"""Pearson SFTP download implementation"""
import logging
import os
import zipfile
from contextlib import contextmanager

from django.conf import settings
from paramiko import SSHException

from exams.pearson import audit
from exams.pearson.constants import (
    EAC_SUCCESS_STATUS,
    PEARSON_FILE_TYPE_EAC,
    PEARSON_FILE_TYPE_VCDC,
    VCDC_SUCCESS_STATUS,
)
from exams.pearson.exceptions import RetryableSFTPException
from exams.pearson.readers import (
    EACReader,
    VCDCReader,
)
from exams.pearson import utils
from exams.models import (
    ExamAuthorization,
    ExamProfile,
)

log = logging.getLogger(__name__)


@contextmanager
def locally_extracted(zip_file, member):
    """
    Context manager for temporarily extracting a zip file member to the local filesystem

    Args:
        zip_file (zipfile.ZipFile): the zip file to extract from
        member (str): the name of the file to extract

    Yields:
        file: the extracted file object
    """
    extracted_file_path = zip_file.extract(member, path=settings.EXAMS_SFTP_TEMP_DIR)
    try:
        # csv.reader requires files to be opened in text mode, not binary
        with open(extracted_file_path, 'r') as extracted_file:
            yield extracted_file
    finally:
        if os.path.exists(extracted_file_path):
            os.remove(extracted_file_path)


class ArchivedResponseProcessor:
    """
    Handles fetching and processing of files stored in a ZIP archive on Pearson SFTP
    """
    def __init__(self, sftp):
        self.sftp = sftp
        self.auditor = audit.ExamDataAuditor()

    def fetch_file(self, remote_path):
        """        Fetches a remote file and returns the local path

        Args:
            remote_path (str): the remote path of the file to fetch

        Returns:
            str: the local path of the file
        """
        local_path = os.path.join(settings.EXAMS_SFTP_TEMP_DIR, remote_path)

        self.sftp.get(remote_path, localpath=local_path)

        return local_path

    def filtered_files(self):
        """
        Walks a directory and yields files that match the pattern

        Yields:
            (str, str): a tuple of (remote_path, local_path)
        """
        for remote_path in self.sftp.listdir():
            if self.sftp.isfile(remote_path) and utils.is_zip_file(remote_path):
                yield remote_path, self.fetch_file(remote_path)

    def process(self):
        """
        Process response files
        """
        try:
            with self.sftp.cd(settings.EXAMS_SFTP_RESULTS_DIR):
                for remote_path, local_path in self.filtered_files():
                    try:
                        if self.process_zip(local_path):
                            self.sftp.remove(remote_path)

                        log.debug("Processed remote file: %s", remote_path)
                    except (EOFError, SSHException,):
                        raise
                    except:  # pylint: disable=bare-except
                        log.exception("Error processing file: %s", remote_path)
                    finally:
                        if os.path.exists(local_path):
                            os.remove(local_path)
        except (EOFError, SSHException,) as exc:
            raise RetryableSFTPException("Exception processing response files") from exc

    def process_zip(self, local_path):
        """
        Process a single zip file

        Args:
            local_path (str): path to the zip file on the local filesystem

        Returns:
            bool: True if all files processed successfully
        """
        processed = True

        # audit before we process in case the process dies
        self.auditor.audit_response_file(local_path)

        log.info('Processing Pearson zip file: %s', local_path)

        # extract the zip and walk the files
        with zipfile.ZipFile(local_path) as zip_file:
            for extracted_filename in zip_file.namelist():
                log.info('Processing file %s extracted from %s', extracted_filename, local_path)
                with locally_extracted(zip_file, extracted_filename) as extracted_file:
                    result, errors = self.process_extracted_file(extracted_file, extracted_filename)

                    processed = result and processed

                    if len(errors) > 0:
                        utils.email_processing_failures(extracted_filename, local_path, errors)

        return processed

    def process_extracted_file(self, extracted_file, extracted_filename):
        """
        Processes an individual file extracted from the zip

        Args:
            extracted_file (zipfile.ZipExtFile): the extracted file-like or iterable object
            extracted_filename (str): the filename of the extracted file

        Returns:
            (bool, list(str)): bool is True if file processed successfuly, error messages are returned in the list
        """
        file_type = utils.get_file_type(extracted_filename)

        if file_type == PEARSON_FILE_TYPE_VCDC:
            # We send Pearson CDD files and get the results as VCDC files
            return self.process_vcdc_file(extracted_file)
        elif file_type == PEARSON_FILE_TYPE_EAC:
            # We send Pearson EAD files and get the results as EAC files
            return self.process_eac_file(extracted_file)

        return False, []

    def get_invalid_row_messages(self, rows):  # pylint: disable=no-self-use
        """
        Converts a list of failed rows to a list of error messages

        Args:
            rows (iterable): iterable of rows

        Returns:
            list(str): list of error messages
        """
        return [
            "Unable to parse row `{row}`".format(
                row=row,
            ) for row in rows
        ]

    def process_vcdc_file(self, extracted_file):  # pylint: disable=no-self-use
        """
        Processes a VCDC file extracted from the zip

        Args:
            extracted_file (zipfile.ZipExtFile): the extracted file-like object

        Returns:
            (bool, list(str)): bool is True if file processed successfuly, error messages are returned in the list
        """
        log.debug('Found VCDC file: %s', extracted_file)
        results, invalid_rows = VCDCReader().read(extracted_file)
        messages = self.get_invalid_row_messages(invalid_rows)
        for result in results:
            try:
                exam_profile = ExamProfile.objects.get(profile__student_id=result.client_candidate_id)
            except ExamProfile.DoesNotExist:
                error_message = "Unable to find an ExamProfile record for profile_id `{profile_id}`".format(
                    profile_id=result.client_candidate_id
                )
                log.error(error_message)
                messages.append(error_message)
                continue

            if result.status == EAC_SUCCESS_STATUS and 'WARNING' not in result.message:
                exam_profile.status = ExamProfile.PROFILE_SUCCESS
            else:
                exam_profile.status = ExamProfile.PROFILE_FAILED
                error_message = "ExamProfile sync failed for user `{username}`.{error_message}".format(
                    username=exam_profile.profile.user.username,
                    error_message=(
                        " Received error: '{error}'.".format(
                            error=result.message
                        ) if result.message else ''
                    )
                )
                log.error(error_message)
                messages.append(error_message)

            exam_profile.save()

        return True, messages

    def process_eac_file(self, extracted_file):  # pylint: disable=no-self-use
        """
        Processes a EAC file extracted from the zip

        Args:
            extracted_file (zipfile.ZipExtFile): the extracted file-like object

        Returns:
            (bool, list(str)): bool is True if file processed successfuly, error messages are returned in the list
        """
        log.debug('Found EAC file: %s', extracted_file)
        results, invalid_rows = EACReader().read(extracted_file)
        messages = self.get_invalid_row_messages(invalid_rows)
        for result in results:
            try:
                exam_authorization = ExamAuthorization.objects.get(id=result.exam_authorization_id)
            except ExamAuthorization.DoesNotExist:
                error_message = (
                    'Unable to find information for authorization_id: `{authorization_id}` and '
                    'candidate_id: `{candidate_id}` in our system.'
                ).format(
                    authorization_id=result.exam_authorization_id,
                    candidate_id=result.candidate_id
                )
                log.error(error_message)
                messages.append(error_message)
                continue

            if result.status == VCDC_SUCCESS_STATUS:
                exam_authorization.status = ExamAuthorization.STATUS_SUCCESS
            else:
                exam_authorization.status = ExamAuthorization.STATUS_FAILED
                error_message = (
                    "Exam authorization failed for user `{username}` "
                    "with authorization id `{authorization_id}`. {error_message}"
                ).format(
                    username=exam_authorization.user.username,
                    authorization_id=result.exam_authorization_id,
                    error_message=(
                        "Received error: '{error}'.".format(
                            error=result.message
                        ) if result.message else ''
                    )
                )
                log.error(error_message)
                messages.append(error_message)

            exam_authorization.save()

        return True, messages
