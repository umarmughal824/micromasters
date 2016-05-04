"""
Decorators for views
"""
from functools import wraps

from django.shortcuts import redirect


def require_terms_of_service(func):
    """
    If user profile does not have terms of service, redirect to terms of service
    """
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        """
        Wrapper for require_terms_of_service

        Args:
            request (django.http.request.HttpRequest): A request
        """
        if not request.user.is_anonymous() and request.path != '/terms_of_service/':
            profile = request.user.profile
            if not profile.agreed_to_terms_of_service:
                return redirect('/terms_of_service/')

        return func(request, *args, **kwargs)
    return wrapper
