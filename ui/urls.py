"""
URLs for ui
"""
from django.conf.urls import url

from ui.views import dashboard

urlpatterns = [
    url(r'^(dashboard|profile)/', dashboard, name='ui-dashboard'),
    url(r'^logout/$', 'django.contrib.auth.views.logout',
        {'next_page': '/'})
]
