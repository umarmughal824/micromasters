"""Exam auditing"""
import base64
import logging
import os
import re

from boto.s3 import (
    connection,
    key,
)
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
import gnupg

from micromasters import utils

SSE_ENCRYPTION_ALGORITHM = 'AES256'
REQUIRED_SETTINGS = [
    'EXAMS_AUDIT_ENCRYPTION_FINGERPRINT',
    'EXAMS_AUDIT_ENCRYPTION_PUBLIC_KEY',
]

log = logging.getLogger(__name__)


class S3AuditStorage:
    """Audit storage mechanism for S3"""

    def configure(self):
        """
        Configures / validates the storage configuration

        Raises:
            ImproperlyConfigured: if a required setting is not set
        """
        missing_settings = [key for key in (
            'EXAMS_AUDIT_S3_BUCKET',
            'EXAMS_AUDIT_AWS_ACCESS_KEY_ID',
            'EXAMS_AUDIT_AWS_SECRET_ACCESS_KEY',
        ) if not getattr(settings, key)]

        if missing_settings:
            raise ImproperlyConfigured(
                'The following setting(s) are required but not set: {}'.format(missing_settings)
            )

    def get_connection(self):
        """
        Creates a connection to S3

        Returns:
            boto.s3.connection.S3Connection: a connection to S3
        """
        return connection.S3Connection(
            settings.EXAMS_AUDIT_AWS_ACCESS_KEY_ID,
            settings.EXAMS_AUDIT_AWS_SECRET_ACCESS_KEY
        )

    def get_bucket(self):
        """
        Gets the configured bucket

        Raises:
            ImproperlyConfigured: if a required setting is not set

        Returns:
            boto.s3.bucket.Bucket: the S3 bucket for storage
        """
        return self.get_connection().get_bucket(settings.EXAMS_AUDIT_S3_BUCKET)

    def get_s3_key(self, filename, file_type):
        """
        Determines the S3 key to store the file under

        Args:
            filename (str): filename of the encrypted file
            file_type (str): type of the encrypted file

        Returns:
            boto.s3.key.Key: the key to store the file in
        """
        basename = os.path.basename(filename)
        return key.Key(
            self.get_bucket(),
            'exam_audits/{file_type}/{filename}'.format(
                filename=basename,
                file_type=file_type,
            )
        )

    def upload(self, filename, file_type):
        """
        Uploads the file to S3

        Args:
            filename (str): filename of the encrypted file
            file_type (str): type of the encrypted file

        Returns:
            str: the key path in S3 where the file was stored
        """
        s3_key = self.get_s3_key(filename, file_type)
        s3_key.set_contents_from_filename(
            filename,
            headers={
                'x-amz-server-side-encryption': SSE_ENCRYPTION_ALGORITHM,
            }
        )
        return s3_key.key


class ExamDataAuditor:
    """
    Encrypted file auditor for exam requests/responses
    """
    REQUEST = 'request'
    RESPONSE = 'response'

    def __init__(self, gpg=None, store=None):
        self.gpg = gpg or gnupg.GPG()
        self.store = store or S3AuditStorage()
        self.configured = False

    @property
    def fingerprint(self):
        """The fingerprint for the public GPG key"""
        return re.sub(r'\s+', '', settings.EXAMS_AUDIT_ENCRYPTION_FINGERPRINT)

    @property
    def public_key(self):
        """The public GPG key"""
        return base64.b64decode(settings.EXAMS_AUDIT_ENCRYPTION_PUBLIC_KEY).decode('utf-8')

    def get_fingerprints(self):
        """
        Get the fingerprints of keys currently loaded on the system

        Returns:
            list: list of keys
        """
        return self.gpg.list_keys().fingerprints

    def configure(self):
        """
        Performs a one-time configuration of GPG keys

        Raises:
            ImproperlyConfigured: settings are missing or invalid

        Returns:
            bool: True if configuration successful
        """
        if self.configured:
            return

        # if any of the settings are not set, we consider this feature not enabled
        if not all(getattr(settings, key) for key in REQUIRED_SETTINGS):
            raise ImproperlyConfigured(
                "One of EXAMS_AUDIT_ENCRYPTION_PUBLIC_KEY or "
                "EXAMS_AUDIT_ENCRYPTION_FINGERPRINT is required but not set"
            )

        if self.fingerprint in self.get_fingerprints():
            self.configured = True
            return

        result = self.gpg.import_keys(self.public_key)

        if result.counts['not_imported'] != 0:
            raise ImproperlyConfigured('Error importing GPG keys for exam auditing: {}'.format(result.summary()))

        if self.fingerprint not in result.fingerprints:
            raise ImproperlyConfigured(
                "Exam auditing GPG key successfully imported but {actual} "
                "does not contain fingerprint: {expected}".format(
                    actual=result.fingerprints,
                    expected=self.fingerprint,
                )
            )

        self.store.configure()

        self.configured = True

    def upload_encrypted_file(self, filename, file_type):
        """
        Uploads the file to S3

        Args:
            filename: absolute path to the local file
            file_type (str): the type of file, either RESPONSE or REQUEST

        Returns:
            str: absolute path to the local encrypted file
        """
        encrypted_filename = '{}.gpg'.format(filename)

        log.debug('Encrypting file %s to %s', filename, encrypted_filename)

        try:
            with open(filename) as source_file:
                self.gpg.encrypt(
                    source_file,
                    self.fingerprint,
                    armor=False,
                    symmetric=False,
                    output=encrypted_filename
                )

            return self.store.upload(encrypted_filename, file_type)
        finally:
            utils.safely_remove_file(encrypted_filename)

    def audit_file(self, filename, file_type):
        """
        Audits the given file - this means we encrypt it and store it on S3

        Args:
            filename (str): path to the unencrypted file
            file_type (str): the type of file, either RESPONSE or REQUEST

        Returns:
            str: the path where the file was stored
        """
        if not settings.EXAMS_AUDIT_ENABLED:
            return None

        self.configure()

        return self.upload_encrypted_file(filename, file_type)

    def audit_response_file(self, filename):
        """
        Audits the given response file, see audit() for details

        Args:
            filename (str): path to the unencrypted file

        Returns: :
            str: the path where the file was stored
        """
        return self.audit_file(filename, self.RESPONSE)

    def audit_request_file(self, filename):
        """
        Audits the given request file, see audit() for details

        Args:
            filename (str): path to the unencrypted file

        Returns:
            str: the path where the file was stored
        """
        return self.audit_file(filename, self.REQUEST)
