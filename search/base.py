"""
Base test classes for search
"""
from unittest.mock import patch

from django.test import (
    TestCase,
)

from search import indexing_api
from search.indexing_api import recreate_index, delete_index


class ESTestCase(TestCase):
    """
    Test class for test cases that need a live ES index
    """

    @classmethod
    def setUpClass(cls):
        # Make sure index exists when signals are run.
        recreate_index()
        super().setUpClass()

    def setUp(self):
        # Make sure index exists when signals are run.
        # We want to run recreate_index instead of clear_index
        # because the test data is contained in a transaction
        # which is reverted after each test runs, so signals don't get run
        # that keep ES up to date.
        recreate_index()
        super().setUp()

    @classmethod
    def tearDownClass(cls):
        delete_index()
        super().tearDownClass()


class MockedESTestCase(TestCase):
    """
    Test class that mocks the MicroMasters indexing API to avoid unnecessary ES index operations
    """
    @classmethod
    def setUpClass(cls):
        cls.patchers = []
        for name, val in indexing_api.__dict__.items():
            if callable(val):
                cls.patchers.append(patch('search.indexing_api.{0}'.format(name), autospec=True))
        for patcher in cls.patchers:
            patcher.start()
        try:
            super().setUpClass()
        except:
            for patcher in cls.patchers:
                patcher.stop()
            raise

    @classmethod
    def tearDownClass(cls):
        for patcher in cls.patchers:
            patcher.stop()

        super().tearDownClass()
