"""
ui views
"""
import json
from django.conf import settings
from django.contrib.staticfiles.templatetags.staticfiles import static
from django.shortcuts import render
from courses.models import Program


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


def index(request):
    """
    The index view. Display available programs
    """

    programs = Program.objects.filter(live=True)

    js_settings = {
        "gaTrackingID": settings.GA_TRACKING_ID,
    }

    return render(request, "index.html", context={
        "programs": programs,
        "style_src": get_bundle_url(request, "style.js"),
        "public_src": get_bundle_url(request, "public.js"),
        "authenticated": not request.user.is_anonymous(),
        "username": request.user.username,
        "js_settings_json": json.dumps(js_settings),
    })


def dashboard(request):
    """
    The app dashboard view
    """
    js_settings = {
        "gaTrackingID": settings.GA_TRACKING_ID,
        "reactGaDebug": settings.REACT_GA_DEBUG
    }

    return render(
        request, "dashboard.html",
        context={
            "style_src": get_bundle_url(request, "style.js"),
            "dashboard_src": get_bundle_url(request, "dashboard.js"),
            "js_settings_json": json.dumps(js_settings),
        }
    )
