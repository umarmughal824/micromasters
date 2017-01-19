"""Utilities for Pearson-specific code"""
import re

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

from mail import api as mail_api

ZIP_FILE_RE = re.compile(r'^.+\.zip$')
EXTRACTED_FILE_RE = re.compile(r"""
    ^
    (                        # supported file types
        vcdc |               # Vue Candidate Data Confirmation
        eac                  # Exam Authorization Confirmation
    )
    \-
    (\d{4}\-\d{2}\-\d{2})    # date of file export
    .*?                      # nothing standard after the date
    \.dat                    # extension
    $
""", re.VERBOSE)


def is_zip_file(filename):
    """
    Checks if a filename looks like a zip file

    Args:
        filename (str): filename to check
    Returns:
        bool: True if the file is a zip file
    """
    return bool(ZIP_FILE_RE.match(filename))


def get_file_type(filename):
    """
    Determines the file type of a Pearson response file
    Args:
        filename (str): the filename to determine the type of

    Returns:
        str: the file type of the file
    """
    match = EXTRACTED_FILE_RE.match(filename)
    return match.group(1) if match else None


def email_processing_failures(filename, zipfile, messages):
    """
    Email summary of failures to mm admin

    Args:
        filename(str): Path of file on local machine.
        zipfile(str): Filename of the zip file
        messages(list): List of error messages compiled in processing
            Exam Authorization Confirmation files (EAC) file.
    """
    if getattr(settings, 'ADMIN_EMAIL', None) is None:
        raise ImproperlyConfigured('Setting ADMIN_EMAIL is not set')

    error_messages = '\n'.join('- {}'.format(message) for message in messages)
    subject = "Summary of failures of Pearson file='{file}'".format(file=filename)
    body = (
        "Hi,\n"
        "The following errors were found in the file {filename} in {zipfile}:\n\n"
        "{messages}"
    ).format(
        messages=error_messages,
        filename=filename,
        zipfile=zipfile
    )

    mail_api.MailgunClient().send_individual_email(
        subject,
        body,
        settings.ADMIN_EMAIL
    )
