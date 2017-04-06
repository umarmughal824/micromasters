"""Utilities for Pearson-specific code"""
from datetime import datetime
import re

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
import pytz

from exams.pearson.exceptions import UnparsableRowException
from exams.pearson.constants import PEARSON_DATETIME_FORMAT

from mail import api as mail_api

ZIP_FILE_RE = re.compile(r'^.+\.zip$')


def is_zip_file(filename):
    """
    Checks if a filename looks like a zip file

    Args:
        filename (str): filename to check
    Returns:
        bool: True if the file is a zip file
    """
    return bool(ZIP_FILE_RE.match(filename))


def parse_or_default(parser, default):
    """
    Generate a function that safely parses a value or returns the default

    Args:
        parser (callable): callable to parse the value
        default (Any): default value if parser fails

    Returns:
        callable: function that returns the parser's return value if it succeeds, otherwise it returns the default
    """
    def inner(value):
        """Inner function that performs the safe parsing"""
        try:
            return parser(value)
        except (ValueError, TypeError):
            return default
    return inner


def parse_datetime(dt):
    """
    Parses a datetime from Pearson's format

    Args:
        dt (str): datetime string to be parsed

    Returns:
        datetime.datetime: parsed datetime
    """
    return datetime.strptime(dt, PEARSON_DATETIME_FORMAT).replace(tzinfo=pytz.UTC)


def parse_bool(value):
    """
    Parses boolean values as formatted by Pearson

    Args:
        value (str): boolean string representation

    Returns:
        bool: parsed boolean value
    """
    value = value.lower()
    if value == 'true':
        return True
    elif value == 'false':
        return False
    else:
        raise UnparsableRowException('Unexpected boolean value: {}'.format(value))


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
