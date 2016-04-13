"""
context processors for ui
"""
from django.conf import settings


def google_analytics(request):
    """inject GA_TRACKING_ID into templates"""
    # pylint: disable=unused-argument
    return {'GA_TRACKING_ID': settings.GA_TRACKING_ID}
