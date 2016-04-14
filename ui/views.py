"""
ui views
"""
import json
import logging

from django.conf import settings
from django.contrib.staticfiles.templatetags.staticfiles import static
from django.shortcuts import render
from django.contrib.auth.decorators import login_required

log = logging.getLogger(__name__)


def get_bundle_url(request, bundle_name):
    """
    Create a URL for the webpack bundle.
    """
    if settings.DEBUG and settings.USE_WEBPACK_DEV_SERVER:
        host = request.get_host().split(":")[0]

        return "{host_url}/{bundle}".format(
            host_url=settings.WEBPACK_SERVER_URL.format(host=host),
            bundle=bundle_name
        )
    else:
        return static("bundles/{bundle}".format(bundle=bundle_name))


@login_required()
def dashboard(request, *args):  # pylint: disable=unused-argument
    """
    The app dashboard view
    """
    host = request.get_host().split(":")[0]

    name = ""
    if not request.user.is_anonymous():
        name = request.user.profile.preferred_name or request.user.username

    js_settings = {
        "gaTrackingID": settings.GA_TRACKING_ID,
        "reactGaDebug": settings.REACT_GA_DEBUG,
        "authenticated": not request.user.is_anonymous(),
        "name": name,
        "username": request.user.username,
        "host": host,
        "edx_base_url": settings.EDXORG_BASE_URL
    }

    return render(
        request, "dashboard.html",
        context={
            "style_src": get_bundle_url(request, "style.js"),
            "dashboard_src": get_bundle_url(request, "dashboard.js"),
            "js_settings_json": json.dumps(js_settings),
        }
    )
