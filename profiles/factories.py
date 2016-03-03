"""Factories for making test data"""
from django.contrib.auth.models import User
import factory
from factory.django import DjangoModelFactory
import faker

from profiles.models import Profile


FAKE = faker.Factory.create()


class UserFactory(DjangoModelFactory):
    """Factory for Users"""
    username = factory.Sequence(lambda n: "user_%d" % n)

    class Meta:  # pylint: disable=missing-docstring,no-init,too-few-public-methods,old-style-class
        model = User


class ProfileFactory(DjangoModelFactory):
    """Factory for Profiles"""
    user = factory.SubFactory(UserFactory)
    has_profile_image = factory.LazyAttribute(lambda x: FAKE.boolean())
    requires_parental_consent = factory.LazyAttribute(lambda x: FAKE.boolean())

    class Meta:  # pylint: disable=missing-docstring
        model = Profile
