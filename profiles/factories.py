"""Factories for making test data"""
from django.contrib.auth.models import User
import factory
from factory.django import DjangoModelFactory
import faker


FAKE = faker.Factory.create()


class UserFactory(DjangoModelFactory):
    """Factory for Users"""
    username = factory.Sequence(lambda n: "user_%d" % n)

    class Meta:  # pylint: disable=missing-docstring,no-init,too-few-public-methods,old-style-class
        model = User
