"""Factories for mail models"""
from factory import (
    Faker,
    SubFactory,
)
from factory.django import DjangoModelFactory
from factory.fuzzy import FuzzyText

from mail.models import AutomaticEmail
from search.factories import PercolateQueryFactory
from micromasters.factories import UserFactory


class AutomaticEmailFactory(DjangoModelFactory):
    """Factory for AutomaticEmail"""
    query = SubFactory(PercolateQueryFactory)
    enabled = Faker('boolean')
    email_subject = FuzzyText()
    email_body = FuzzyText()
    sender_name = Faker('name')
    staff_user = SubFactory(UserFactory)

    class Meta:
        model = AutomaticEmail
