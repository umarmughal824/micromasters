"""
URLs for ui
"""
from django.conf.urls import url

from ui.views import index


urlpatterns = [
    url(r'^$', index, name='ui-index'),
]
