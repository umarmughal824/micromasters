"""
Models for user profile
"""
from django.conf import settings
from django.db import models


class DiscussionUser(models.Model):
    """
    Tracks the user's discussion user and profile
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="discussion_user")
    username = models.CharField(max_length=26, null=True)
    last_sync = models.DateTimeField(null=True)

    def __str__(self):
        return "Discussion Profile: {}".format(self.username)
