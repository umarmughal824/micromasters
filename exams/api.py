"""
API for exams app
"""
import hashlib

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


def sso_digest(client_candidate_id, timestamp, session_timeout):
    """
    Compute the sso_digest value we need to send to pearson

    Args:
        client_candidate_id (int|str): id for the user, usually Profile.student_id
        timestamp (int): unix timestamp
        session_timeout (int): number of seconds the session will last

    Returns:
        str: the computed digest value
    """
    if settings.EXAMS_SSO_PASSPHRASE is None:
        raise ImproperlyConfigured("EXAMS_SSO_PASSPHRASE is not configured")
    if settings.EXAMS_SSO_CLIENT_CODE is None:
        raise ImproperlyConfigured("EXAMS_SSO_CLIENT_CODE is not configured")

    data = ''.join([
        settings.EXAMS_SSO_PASSPHRASE,
        settings.EXAMS_SSO_CLIENT_CODE,
        str(timestamp),
        str(session_timeout),
        str(client_candidate_id),
    ]).encode('iso-8859-1')
    return hashlib.sha256(data).hexdigest()
