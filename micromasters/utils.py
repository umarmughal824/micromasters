"""
General micromasters utility functions
"""
import json
from django.conf import settings


def webpack_dev_server_host(request):
    """
    Get the correct webpack dev server host
    """
    return settings.WEBPACK_DEV_SERVER_HOST or request.get_host().split(":")[0]


def webpack_dev_server_url(request):
    """
    Get the full URL where the webpack dev server should be running
    """
    return 'http://{}:{}'.format(webpack_dev_server_host(request), settings.WEBPACK_DEV_SERVER_PORT)


def load_json_from_file(project_rel_filepath):
    """
    Loads JSON data from a file
    """
    path = '{}/{}'.format(settings.BASE_DIR, project_rel_filepath)
    with open(path, 'r') as f:
        return json.load(f)
