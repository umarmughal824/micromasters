"""
Pytest configuration file for the entire micromasters app
"""
# pylint: disable=redefined-outer-name
from unittest.mock import patch
from types import SimpleNamespace
import pytest

from search import tasks


@pytest.fixture(scope='module')
def mocked_elasticsearch_module_patcher():
    """
    Fixture that patches all indexing API functions that communicate directly with ElasticSearch
    """
    patchers = []
    patcher_mocks = []
    for name, val in tasks.__dict__.items():
        # This looks for functions starting with _ because those are the functions which are imported
        # from indexing_api. The _ lets it prevent name collisions.
        if callable(val) and name.startswith("_"):
            patchers.append(patch('search.tasks.{0}'.format(name), autospec=True))
    for patcher in patchers:
        mock = patcher.start()
        mock.name = patcher.attribute
        patcher_mocks.append(mock)
    yield SimpleNamespace(
        patchers=patchers,
        patcher_mocks=patcher_mocks
    )
    for patcher in patchers:
        patcher.stop()


@pytest.fixture()
def mocked_elasticsearch(mocked_elasticsearch_module_patcher):
    """
    Fixture that resets all of the patched ElasticSearch API functions
    """
    for mock in mocked_elasticsearch_module_patcher.patcher_mocks:
        mock.reset_mock()
    return mocked_elasticsearch_module_patcher
