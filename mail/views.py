"""
Views for email REST APIs
"""
import logging

from rest_framework import (
    authentication,
    permissions,
)
from rest_framework.views import APIView
from rest_framework.response import Response

from search.api import (
    prepare_and_execute_search,
    get_all_query_matching_emails
)
from mail.api import MailgunClient
from mail.permissions import UserCanMessageLearnersPermission


log = logging.getLogger(__name__)


class MailView(APIView):
    """
    View class that authenticates and handles HTTP requests to mail API URLs
    """
    authentication_classes = (authentication.SessionAuthentication, )
    permission_classes = (permissions.IsAuthenticated, UserCanMessageLearnersPermission, )

    def post(self, request, *args, **kargs):  # pylint: disable=unused-argument, no-self-use, missing-docstring
        emails = prepare_and_execute_search(
            request.user,
            search_param_dict=request.data.get('search_request'),
            search_func=get_all_query_matching_emails
        )
        mailgun_resp = MailgunClient.send_bcc(
            request.data['email_subject'],
            request.data['email_body'],
            ','.join(emails)
        )
        return Response(
            status=mailgun_resp.status_code
        )
