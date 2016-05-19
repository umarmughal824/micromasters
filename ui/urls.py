"""
URLs for ui
"""
from django.conf.urls import url

from ui.url_utils import (
    DASHBOARD_URL,
    PROFILE_URL,
    TERMS_OF_SERVICE_URL,
    USERS_URL,
)
from ui.views import dashboard

dashboard_urlpatterns = [
    url(r'^{}'.format(dashboard_url.lstrip("/")), dashboard, name='ui-dashboard')
    for dashboard_url in [
        DASHBOARD_URL,
        PROFILE_URL,
        TERMS_OF_SERVICE_URL,
        USERS_URL,
    ]
]

urlpatterns = [
    url(r'^logout/$', 'django.contrib.auth.views.logout',
        {'next_page': '/'})
] + dashboard_urlpatterns
