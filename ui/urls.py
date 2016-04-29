"""
URLs for ui
"""
from django.conf.urls import url

from ui.views import dashboard

DASHBOARD_URL = '/dashboard/'
PROFILE_URL = '/profile/'
PROFILE_PERSONAL_URL = '/profile/personal/'
TERMS_OF_SERVICE_URL = '/terms_of_service/'

dashboard_urlpatterns = [
    url(r'^{}'.format(dashboard_url.lstrip("/")), dashboard, name='ui-dashboard')
    for dashboard_url in [
        DASHBOARD_URL,
        PROFILE_URL,
        PROFILE_PERSONAL_URL,
        TERMS_OF_SERVICE_URL,
    ]
]

urlpatterns = [
    url(r'^(dashboard|profile|terms_of_service)/', dashboard, name='ui-dashboard'),
    url(r'^logout/$', 'django.contrib.auth.views.logout',
        {'next_page': '/'})
] + dashboard_urlpatterns
