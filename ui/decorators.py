"""
Decorators for views
"""
from functools import wraps

from django.shortcuts import redirect

from ui.url_utils import (
    PROFILE_URL,
    TERMS_OF_SERVICE_URL,
)


def require_mandatory_urls(func):
    """
    If user profile does not have terms of service, redirect to terms of service
    If user profile is not filled out, redirect to profile
    """
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        """
        Wrapper for check mandatory parts of the app

        Args:
            request (django.http.request.HttpRequest): A request
        """
        if not request.user.is_anonymous():
            if request.path != TERMS_OF_SERVICE_URL:
                profile = request.user.profile
                if not profile.agreed_to_terms_of_service:
                    return redirect(TERMS_OF_SERVICE_URL)
                if not request.path.startswith(PROFILE_URL) and not profile.filled_out:
                    return redirect(PROFILE_URL)

        return func(request, *args, **kwargs)
    return wrapper
