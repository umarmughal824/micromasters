"""Tests for auditing"""
from unittest.mock import (
    call,
    DEFAULT,
    Mock
)
import base64
import copy
import tempfile
import os
import re

from django.core.exceptions import ImproperlyConfigured
from django.test import override_settings
import gnupg
import pytest

from exams.pearson import audit

# pylint: disable=missing-docstring,redefined-outer-name,unused-argument

PUBLIC_KEY = """-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: GnuPG v1

mI0EWN1k1wEEALiMsgDtV68qvg4d07eY6LrG8L7PWdSgZGon+UUMIMHQXe1CpGbn
Cgm8it/gN8y/oR8TUUs3zzxndbxERQOHb5wi8zs609dMK9xZQqhuCLpbv2Uo0A1p
qDoWLcxtcNnN3fbBWEJNTyFlwd90pLbDjmp7Hb6+PAHnyWDIJR4RWRTdABEBAAG0
IkhlaW56IERvb2ZlbnNobWlydHogPGRvb2ZAbWl0LmVkdT6IuAQTAQIAIgUCWN1k
1wIbAwYLCQgHAwIGFQgCCQoLBBYCAwECHgECF4AACgkQKpcMy6vPbHRW0wP/cvr5
5av7I82hQkHVmipVnjj9VtBDW5x4iTvYqzQCKPvKhfG7bw3VObrQaV+iUoWBzr0s
iSjKDKUFcrwrjnjbIrWHfKEtcG+wDcnhWfLCnSyP8IPavgdfDIWEE7/tpSmA8wvp
inh3YnAicgF487TEpRxy25I1iJDpx8P0GWbms1u4jQRY3WTXAQQAvmfcnbUZkkW4
AasgBI9oxfkh7chOiHHtaIjmTGdo1sOLyvQBQhIgV9SiN/iTc57VvJ/svWs/bh4q
BzsXQFpI/WQQUaj5b1y1A8geYsVLUR7eFFtFb+/ujBdzX43QmjPiDCikpltfZJOa
AUtLMpfrHKmvrULQG1Nrn3x97MmMW3UAEQEAAYifBBgBAgAJBQJY3WTXAhsMAAoJ
ECqXDMurz2x0YWYEALCoRIjJqomOk1G5AZxJl5zRhG++HXBnh86NtJCiQ530wHBQ
lZzh+Qa/ZqOJ4/bucvr57pTekxaPbQeocPkiKPTRHGR+pCnQ+v+sy5ZDuSVwzqtX
j6VMC+4fsNKKbrSgFBTgOViYgaa2jkIy3b4xfG9YPVT6O7hfOgmXHDs2/e7f
=RI1Z
-----END PGP PUBLIC KEY BLOCK-----"""
FINGERPRINT = "8690 9C7E 0929 58F8 DEBE  9365 2A97 0CCB ABCF 6C74"
FINGERPRINT_STRIPPED = re.sub(r'\s+', '', FINGERPRINT)


def encode_test_value(value):
    """Encode a test value"""
    return base64.b64encode(bytes(value, 'utf-8'))


DEFAULT_SETTINGS = {
    'EXAMS_AUDIT_ENABLED': True,
    'EXAMS_AUDIT_ENCRYPTION_PUBLIC_KEY': encode_test_value(PUBLIC_KEY),
    'EXAMS_AUDIT_ENCRYPTION_FINGERPRINT': FINGERPRINT,
    'EXAMS_AUDIT_S3_BUCKET': '.test.bucket.name.',
    'EXAMS_AUDIT_AWS_ACCESS_KEY_ID': 'test.id',
    'EXAMS_AUDIT_AWS_SECRET_ACCESS_KEY': 'test.access.key',
}


@pytest.fixture()
def valid_settings():
    """
    Fixture that provides valid (passes checks in configure()) configuration
    """
    with override_settings(**DEFAULT_SETTINGS):
        yield DEFAULT_SETTINGS


@pytest.fixture(
    ids=['both_bad', 'pubkey_bad', 'fingerprint_bad'],
    params=[{
        'EXAMS_AUDIT_ENCRYPTION_FINGERPRINT': 'bad',
        'EXAMS_AUDIT_ENCRYPTION_PUBLIC_KEY': encode_test_value('bad'),
    }, {
        'EXAMS_AUDIT_ENCRYPTION_PUBLIC_KEY': encode_test_value('bad'),
    }, {
        'EXAMS_AUDIT_ENCRYPTION_FINGERPRINT': 'bad',
    }]
)
def invalid_settings(request):
    """
    Fixture that runs a test against a set of invalid configurations
    """
    settings = copy.copy(DEFAULT_SETTINGS)
    settings.update(request.param)

    with override_settings(**settings):
        yield settings


@pytest.fixture(
    params=[
        'EXAMS_AUDIT_ENCRYPTION_FINGERPRINT',
        'EXAMS_AUDIT_ENCRYPTION_PUBLIC_KEY',
    ]
)
def missing_settings(request):
    """
    Fixture that runs a test with each of the specified settings keys set to None
    """
    settings = copy.copy(DEFAULT_SETTINGS)
    settings[request.param] = None

    with override_settings(**settings):
        yield settings


@pytest.fixture()
def s3_store(valid_settings):
    """S3 storage for tests"""
    return audit.S3AuditStorage()


@pytest.fixture
def auditor(valid_settings):
    """
    ExamDataAuditor that cleans up the GPG keys after itself
    """
    gpg = gnupg.GPG()
    yield audit.ExamDataAuditor(gpg=gpg, store=Mock(spec=audit.S3AuditStorage))
    gpg.delete_keys(FINGERPRINT_STRIPPED)


def test_s3_store_get_connection_valid(s3_store, mocker):
    """Test get_connection given valid settings"""
    mock = mocker.patch('boto.s3.connection.S3Connection')
    s3_store.get_bucket()
    mock.assert_called_once_with('test.id', 'test.access.key')


@pytest.mark.parametrize('key', [
    'EXAMS_AUDIT_AWS_ACCESS_KEY_ID',
    'EXAMS_AUDIT_AWS_SECRET_ACCESS_KEY',
])
def test_s3_store_configure(s3_store, key):
    """Test configure() against missing settings"""
    with override_settings(**{
        key: None,
    }):
        with pytest.raises(ImproperlyConfigured):
            s3_store.configure()


def test_s3_store_get_s3_key(s3_store, mocker):
    """Test that the S3 store generates a key object witht he correct bucket and key"""
    mocker.patch.object(s3_store, 'get_bucket', return_value='.the.bucket.')
    key = s3_store.get_s3_key('filename', 'filetype')
    s3_store.get_bucket.assert_called_once_with()
    assert key.bucket == s3_store.get_bucket()
    assert key.key == 'exam_audits/filetype/filename'


def test_exam_data_s3_store_upload(s3_store, mocker):
    """Test that the S3 store uploads a file with the correct headers"""
    mocker.patch.object(s3_store, 'get_s3_key')

    s3_store.upload('filename', 'filetype')
    mock_key = s3_store.get_s3_key.return_value

    assert mock_key.set_contents_from_filename.call_count == 1
    assert mock_key.set_contents_from_filename.call_args == call(
        'filename',
        headers={
            'x-amz-server-side-encryption': 'AES256'
        }
    )


def test_exam_data_auditor_fingerprint(auditor):
    """Test that fingerprint strips whitespace from the key"""
    assert auditor.fingerprint == FINGERPRINT_STRIPPED


def test_exam_data_auditor_public_key(auditor):
    """Test that this decodes a base64 encoded pubkey"""
    assert auditor.public_key == PUBLIC_KEY


def test_exam_data_auditor_configure(auditor):
    """Test that configure() succeeds with correct settings"""
    auditor.configure()
    assert auditor.gpg.list_keys().fingerprints == [FINGERPRINT_STRIPPED]
    assert auditor.configured is True


def test_exam_data_auditor_configure_already_configured(auditor, mocker):
    """Test that configure() succeeds if already configured"""
    mocker.patch.object(auditor, 'get_fingerprints', return_value=[FINGERPRINT_STRIPPED])
    mocker.spy(auditor.gpg, 'import_keys')
    auditor.configure()
    assert auditor.gpg.import_keys.call_count == 0
    assert auditor.configured is True


def test_exam_data_auditor_enabled(auditor, missing_settings, mocker):
    """Test that audit_file() respected the enabled flag"""
    mocker.patch.multiple(auditor, configure=DEFAULT, upload_encrypted_file=DEFAULT)
    # auditor is disabled
    with override_settings(**{
        'EXAMS_AUDIT_ENABLED': False,
    }):
        auditor.audit_file('file', 'filetype')
    assert auditor.configure.call_count == 0
    # auditor is enabled
    with override_settings(**{
        'EXAMS_AUDIT_ENABLED': True,
    }):
        auditor.audit_file('file', 'filetype')
    assert auditor.configure.call_count == 1


def test_exam_data_auditor_configure_missing_settings(auditor, missing_settings, mocker):
    """Test that configure() fails with missing settings"""
    mocker.spy(auditor, 'get_fingerprints')
    with pytest.raises(ImproperlyConfigured):
        auditor.configure()
    assert auditor.get_fingerprints.call_count == 0
    assert auditor.configured is False


def test_exam_data_auditor_configure_bad_settings(auditor, invalid_settings):
    """Test that configure() fails with invalid settings"""
    with pytest.raises(ImproperlyConfigured):
        auditor.configure()
    assert auditor.configured is False


def test_exam_data_auditor_configure_not_imported(auditor, mocker):
    """Test that configure() succeeds if already configured"""
    mock = mocker.patch.object(auditor.gpg, 'import_keys')
    mock.return_value.counts = {
        'not_imported': 1,
    }
    with pytest.raises(ImproperlyConfigured):
        auditor.configure()
    assert auditor.configured is False


def test_exam_data_auditor_audit_file(auditor):
    """Test that the auditor encrypts and uploads the file"""
    with tempfile.NamedTemporaryFile() as audit_file:
        # the auditor encrypts the file to a local path
        expected_encrypted_filename = '{}.gpg'.format(audit_file.name)
        expected_encrypted_keypath = 'keypath'  # computed inside _upload_to_s3

        def upload_side_effect(encrypted_filename, file_type):
            """Verify the encrypted file exists at this point"""
            # verify the upload was triggered with the expected encrypted filename and that file exists
            assert encrypted_filename == expected_encrypted_filename
            assert os.path.exists(encrypted_filename) is True
            assert file_type == 'sometype'
            return expected_encrypted_keypath
        auditor.store.upload.side_effect = upload_side_effect

        assert auditor.audit_file(audit_file.name, 'sometype') == expected_encrypted_keypath

        # verify it cleaned up after itself
        assert os.path.exists(expected_encrypted_filename) is False


def test_exam_data_auditor_audit_upload_error(auditor):
    with tempfile.NamedTemporaryFile() as audit_file:
        expected_encrypted_filename = '{}.gpg'.format(audit_file.name)
        auditor.store.upload.side_effect = IOError()
        with pytest.raises(IOError):
            auditor.audit_file(audit_file.name, 'sometype')
        assert os.path.exists(expected_encrypted_filename) is False


def test_exam_data_auditor_audit_encrypt_error(auditor, mocker):
    with tempfile.NamedTemporaryFile() as audit_file:
        expected_encrypted_filename = '{}.gpg'.format(audit_file.name)
        mocker.patch.object(auditor.gpg, 'encrypt', side_effect=IOError())
        with pytest.raises(IOError):
            auditor.audit_file(audit_file.name, 'sometype')
        assert os.path.exists(expected_encrypted_filename) is False


def test_exam_data_auditor_audit_request_file(auditor, mocker):
    """Test that request files are uploaded with the correct type"""
    mocker.patch.object(auditor, 'audit_file', return_value=True)
    assert auditor.audit_request_file('test.file') is True
    auditor.audit_file.assert_called_once_with('test.file', auditor.REQUEST)


def test_exam_data_auditor_audit_response_file(auditor, mocker):
    """Test that response files are uploaded with the correct type"""
    mocker.patch.object(auditor, 'audit_file', return_value=True)
    assert auditor.audit_response_file('test.file') is True
    auditor.audit_file.assert_called_once_with('test.file', auditor.RESPONSE)
