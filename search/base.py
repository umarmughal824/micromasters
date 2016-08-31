"""
Base test classes for search
"""
from django.test import TestCase

from search.indexing_api import recreate_index


class ESTestCase(TestCase):
    """
    Set up ES index on setup
    """

    def setUp(self):
        super(ESTestCase, self).setUp()
        recreate_index()
