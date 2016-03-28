"""Views for courses"""
from rest_framework.permissions import IsAuthenticated
from rest_framework.mixins import (
    RetrieveModelMixin,
    UpdateModelMixin,
)
from rest_framework.viewsets import GenericViewSet

from profiles.models import Profile
from profiles.serializers import (
    ProfileSerializer,
    ProfileLimitedSerializer,
    ProfilePrivateSerializer,
)
from profiles.permissions import CanEditIfOwner


class ProfileViewSet(RetrieveModelMixin, UpdateModelMixin, GenericViewSet):
    """API for the Program collection"""
    serializer_class_owner = ProfileSerializer
    serializer_class_limited = ProfileLimitedSerializer
    serializer_class_private = ProfilePrivateSerializer
    permission_classes = (IsAuthenticated, CanEditIfOwner)
    lookup_field = 'user__username'
    lookup_url_kwarg = 'user'
    queryset = Profile.objects.all()

    def get_serializer_class(self):
        """
        Different parts of a user profile are visible in different conditions
        """
        profile = self.get_object()
        if self.request.user == profile.user:
            return self.serializer_class_owner
        elif profile.account_privacy == Profile.PRIVATE:
            return self.serializer_class_private
        else:
            return self.serializer_class_limited
