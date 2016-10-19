"""
WSGI config for ui app.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.8/howto/deployment/wsgi/
"""
import gevent.monkey
gevent.monkey.patch_all()
from psycogreen.gevent import patch_psycopg
patch_psycopg()
import os

from raven.contrib.django.raven_compat.middleware.wsgi import Sentry
from django.core.wsgi import get_wsgi_application
from dj_static import Cling

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "micromasters.settings")

application = Cling(Sentry(get_wsgi_application()))  # pylint: disable=invalid-name
