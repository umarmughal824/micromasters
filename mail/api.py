"""
Provides functions for sending and retrieving data about in-app email
"""
import requests
from django.conf import settings


class MailgunClient:
    """
    Provides functions for communicating with the Mailgun REST API.
    """
    _basic_auth_credentials = ('api', settings.MAILGUN_KEY)
    _base_params = {'from': settings.MAILGUN_FROM_EMAIL}

    @classmethod
    def _mailgun_request(cls, request_func, endpoint, params):
        """
        Sends a request to the Mailgun API

        Args:
            request_func (function): requests library HTTP function (get/post/etc.)
            endpoint (str): Mailgun endpoint (eg: 'messages', 'events')
            params (dict): Dict of params to add to the request as 'data'

        Returns:
            requests.Response: HTTP response
        """
        mailgun_url = '{}/{}'.format(settings.MAILGUN_URL, endpoint)
        return request_func(
            mailgun_url,
            auth=('api', settings.MAILGUN_KEY),
            data=dict(**{'from': settings.MAILGUN_FROM_EMAIL}, **params)
        )

    @classmethod
    def send_bcc(cls, subject, body, recipients=''):
        """
        Sends a text email to a BCC'ed list of recipients. If the
        MAILGUN_RECIPIENT_OVERRIDE setting is specified, the list of recipients
        will be ignored in favor of the recipients in that setting value.

        Args:
            subject (str): Email subject
            body (str): Text email body
            recipients (str): Comma-separated list of recipient emails

        Returns:
            requests.Response: HTTP response from Mailgun
        """
        if settings.MAILGUN_RECIPIENT_OVERRIDE:
            body = '{}\n\n[overridden recipients]\n{}'.format(body, recipients.replace(',', '\n'))
            recipients = settings.MAILGUN_RECIPIENT_OVERRIDE
        params = dict(
            to=settings.MAILGUN_BCC_TO_EMAIL,
            bcc=recipients,
            subject=subject,
            text=body
        )
        return cls._mailgun_request(requests.post, 'messages', params)
