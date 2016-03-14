"""
URLs for ui
"""
from django.conf.urls import url

from ui.views import index, dashboard

urlpatterns = [
    url(r'^dashboard/', dashboard, name='ui-dashboard'),
    url(r'^$', index, name='ui-index'),
]
