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


def dict_without_key(dictionary, key):
    """
    Helper method to remove a key from a dict and return the dict. This can be used in cases like a list comprehension
    where the actual dictionary is needed once the key is deleted ('del' does not return anything)
    """
    del dictionary[key]
    return dictionary


def load_json_from_file(project_rel_filepath):
    """
    Loads JSON data from a file
    """
    path = '{}/{}'.format(settings.BASE_DIR, project_rel_filepath)
    with open(path, 'r') as f:
        return json.load(f)
