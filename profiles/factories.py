"""Factories for making test data"""
from datetime import datetime, timezone

from django.contrib.auth.models import User
from factory import (
    Sequence,
    SubFactory,
)
from factory.django import DjangoModelFactory
from factory.fuzzy import (
    FuzzyAttribute,
    FuzzyChoice,
    FuzzyDateTime,
    FuzzyInteger,
    FuzzyText,
)
import faker

from profiles.models import Profile


FAKE = faker.Factory.create()


class UserFactory(DjangoModelFactory):
    """Factory for Users"""
    username = Sequence(lambda n: "user_%d" % n)

    class Meta:  # pylint: disable=missing-docstring,no-init,too-few-public-methods,old-style-class
        model = User


class ProfileFactory(DjangoModelFactory):
    """Factory for Profiles"""
    user = SubFactory(UserFactory)
    account_privacy = FuzzyChoice(
        [choice[0] for choice in Profile.ACCOUNT_PRIVACY_CHOICES]
    )
    email_optin = FuzzyAttribute(FAKE.boolean)
    employer = FuzzyText(suffix=" corp")
    job_title = FuzzyText(suffix=" consultant")
    state_or_territory = FuzzyText(suffix=" state")
    name = FuzzyText(prefix="User ")
    bio = FuzzyText()
    country = FuzzyText(suffix="land")
    has_profile_image = FuzzyAttribute(FAKE.boolean)
    profile_url_full = FuzzyText(prefix="http://")
    profile_url_large = FuzzyText(prefix="http://")
    profile_url_medium = FuzzyText(prefix="http://")
    profile_url_small = FuzzyText(prefix="http://")
    requires_parental_consent = FuzzyAttribute(FAKE.boolean)
    year_of_birth = FuzzyInteger(1850, 2015)
    level_of_education = FuzzyChoice(
        [choice[0] for choice in Profile.LEVEL_OF_EDUCATION_CHOICES]
    )
    goals = FuzzyText()
    gender = FuzzyChoice(
        [choice[0] for choice in Profile.GENDER_CHOICES]
    )
    mailing_address = FuzzyText()
    date_joined_micromasters = FuzzyDateTime(datetime(1850, 1, 1, tzinfo=timezone.utc))
    language_proficiencies = FuzzyAttribute(lambda: [FAKE.text() for _ in range(3)])

    class Meta:  # pylint: disable=missing-docstring
        model = Profile
