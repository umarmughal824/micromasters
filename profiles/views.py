"""Views for courses"""
import logging
import requests
from django.conf import settings
from django.http import HttpResponse

from rest_framework import status as statuses
from rest_framework.mixins import (
    RetrieveModelMixin,
    UpdateModelMixin,
)
from rest_framework.viewsets import GenericViewSet

from roles.roles import (
    Instructor,
    Staff,
)
from profiles.models import Profile
from profiles.serializers import (
    ProfileSerializer,
    ProfileFilledOutSerializer,
    ProfileLimitedSerializer,
)
from profiles.permissions import (
    CanEditIfOwner,
    CanSeeIfNotPrivate,
)


log = logging.getLogger(__name__)


class ProfileViewSet(RetrieveModelMixin, UpdateModelMixin, GenericViewSet):
    """API for the Program collection"""
    # pylint: disable=too-many-return-statements

    permission_classes = (CanEditIfOwner, CanSeeIfNotPrivate, )
    lookup_field = 'user__social_auth__uid'
    lookup_url_kwarg = 'user'
    lookup_value_regex = '[-\w.]+'  # pylint: disable=anomalous-backslash-in-string
    queryset = Profile.objects.all()

    # possible serializers
    serializer_class_staff = ProfileSerializer
    serializer_class_owner = ProfileSerializer
    serializer_class_filled_out = ProfileFilledOutSerializer
    serializer_class_limited = ProfileLimitedSerializer

    @staticmethod
    def add_email_to_unsub_list(url, email):
        """
        It adds user email to mailgun unsub list.

        Args:
            url (str): mailgun api url:
            email (str): user email
        """
        try:
            response = requests.post(
                url,
                auth=('api', settings.MAILGUN_KEY),
                data={
                    'address': email,
                    'tag': '*'
                }
            )
            if response.status_code == statuses.HTTP_200_OK:
                log.debug(
                    "Added user's email: %s to mailgun unsubscribes list. Message received: %s",
                    email,
                    response.json()
                )
                return True
        except requests.exceptions.RequestException:
            log.exception(
                "Unable to add email: %s to mailgun unsubscribes list.", email
            )
        return False

    @staticmethod
    def remove_email_from_unsub_list(url, email):
        """
        It removes user email from mailgun unsub list.

        Args:
            url (str): mailgun api url:
            email (str): user email
        """
        try:
            response = requests.delete(url, auth=('api', settings.MAILGUN_KEY))
            if response.status_code == statuses.HTTP_200_OK:
                log.debug(
                    "Removed user's email: %s from mailgun unsubscribes list. Message received: %s",
                    email,
                    response.json()
                )
                return True
        except requests.exceptions.RequestException:
            log.exception(
                "Unable to remove email: %s from mailgun unsubscribes list.", email
            )
        return False

    @staticmethod
    def mailgun_action(email_optin, email):
        """
        it removes user from mailgun unsubscribes list.
        https://documentation.mailgun.com/en/latest/api-suppressions.html#delete-a-single-unsubscribe

        Args:
            email_optin (bool): email optin flag
            email (str): user email
        """
        url = "{base}/unsubscribes".format(base=settings.MAILGUN_URL)
        if email_optin:
            url = '{base}/{email}'.format(base=url, email=email)
            return ProfileViewSet.remove_email_from_unsub_list(url, email)
        else:
            return ProfileViewSet.add_email_to_unsub_list(url, email)

    @staticmethod
    def simple_response(status):
        """
        returns status response.

        Args:
            status (int): Http status
        """
        return HttpResponse(status=status)

    def update(self, request, *args, **kwargs):
        """
        updates user profile.
        """
        if 'email_optin' in request.data and 'email' in request.data:
            # perform mailgun action if email optin is set then remove user from mailgun unsubscription
            # list otherwise add user to mailgun unsubscription.
            if ProfileViewSet.mailgun_action(request.data['email_optin'], request.data['email']):
                return super().update(request, *args, **kwargs)
            else:
                return ProfileViewSet.simple_response(statuses.HTTP_304_NOT_MODIFIED)
        return super().update(request, *args, **kwargs)

    def get_serializer_class(self):
        """
        Different parts of a user profile are visible in different conditions
        """
        profile = self.get_object()

        # Owner of the profile
        if self.request.user == profile.user:
            if profile.filled_out or self.request.data.get('filled_out'):
                return self.serializer_class_filled_out
            else:
                return self.serializer_class_owner
        # Staff or instructor is looking at profile
        elif not self.request.user.is_anonymous and self.request.user.role_set.filter(
                role__in=(Staff.ROLE_ID, Instructor.ROLE_ID),
                program__programenrollment__user__profile=profile,
        ).exists():
            return self.serializer_class_staff
        # Profile is public
        elif profile.account_privacy == Profile.PUBLIC:
            return self.serializer_class_limited
        # Profile is public to mm verified users only
        elif profile.account_privacy == Profile.PUBLIC_TO_MM:
            return self.serializer_class_limited
        # this should never happen, but just in case
        return self.serializer_class_limited
