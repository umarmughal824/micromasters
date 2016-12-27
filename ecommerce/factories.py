"""
Factories for ecommerce models
"""
from factory import (
    LazyAttribute,
    SelfAttribute,
    SubFactory,
)
from factory.django import DjangoModelFactory
from factory.fuzzy import (
    FuzzyAttribute,
    FuzzyChoice,
    FuzzyDecimal,
    FuzzyInteger,
    FuzzyText,
)
import faker

from courses.factories import CourseRunFactory
from ecommerce.api import (
    make_reference_id,
    generate_cybersource_sa_signature,
)
from ecommerce.models import (
    Coupon,
    CoursePrice,
    Line,
    Order,
    Receipt,
)
from micromasters.factories import UserFactory


FAKE = faker.Factory.create()


class OrderFactory(DjangoModelFactory):
    """Factory for Order"""
    user = SubFactory(UserFactory)
    status = FuzzyChoice(
        Order.STATUSES
    )
    total_price_paid = FuzzyDecimal(low=0, high=12345)

    class Meta:  # pylint: disable=missing-docstring,no-init,too-few-public-methods,old-style-class
        model = Order


class LineFactory(DjangoModelFactory):
    """Factory for Line"""
    order = SubFactory(OrderFactory)
    price = SelfAttribute('order.total_price_paid')
    description = FuzzyText(prefix="Line ")
    course_key = FuzzyText()

    class Meta:  # pylint: disable=missing-docstring,no-init,too-few-public-methods,old-style-class
        model = Line


def gen_fake_receipt_data(order=None):
    """
    Helper function to generate a fake signed piece of data
    """
    data = {}
    for _ in range(10):
        data[FAKE.text()] = FAKE.text()
    keys = sorted(data.keys())
    data['signed_field_names'] = ",".join(keys)
    data['unsigned_field_names'] = ''
    data['req_reference_number'] = make_reference_id(order) if order else ''
    data['signature'] = generate_cybersource_sa_signature(data)
    return data


class ReceiptFactory(DjangoModelFactory):
    """Factory for Receipt"""
    order = SubFactory(OrderFactory)
    data = LazyAttribute(lambda receipt: gen_fake_receipt_data(receipt.order))

    class Meta:  # pylint: disable=missing-docstring
        model = Receipt


class CoursePriceFactory(DjangoModelFactory):
    """Factory for CoursePrice"""
    course_run = SubFactory(CourseRunFactory)
    is_valid = FuzzyAttribute(FAKE.boolean)
    price = FuzzyDecimal(low=0, high=12345)

    class Meta:  # pylint: disable=missing-docstring,no-init,too-few-public-methods,old-style-class
        model = CoursePrice


class CouponFactory(DjangoModelFactory):
    """Factory for Coupon"""
    amount_type = FuzzyChoice(Coupon.AMOUNT_TYPES)
    coupon_code = FuzzyChoice([None, FuzzyText().fuzz()])
    num_redemptions_per_user = FuzzyInteger(1, 10)
    num_coupons_available = FuzzyInteger(1, 100)

    class Meta:  # pylint: disable=missing-docstring,no-init,too-few-public-methods,old-style-class
        model = Coupon

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        """Override _create to populate content_object"""
        content_object = kwargs.pop('content_object', None)
        instance = model_class(*args, **kwargs)
        course_run = CourseRunFactory.create()
        if content_object is not None:
            instance.content_object = content_object
        else:
            instance.content_object = FuzzyChoice([course_run, course_run.course, course_run.course.program]).fuzz()

        amount_type = kwargs.pop('amount_type', None)
        if amount_type is None:
            instance.amount_type = FuzzyChoice(Coupon.AMOUNT_TYPES).fuzz()
        else:
            instance.amount_type = amount_type

        amount = kwargs.pop('amount', None)
        if amount is None:
            if instance.amount_type == Coupon.PERCENT_DISCOUNT:
                instance.amount = FuzzyDecimal(0, 1).fuzz()
            elif instance.amount_type == Coupon.FIXED_DISCOUNT:
                instance.amount = FuzzyDecimal(100, 1000).fuzz()
        else:
            instance.amount = amount
        instance.save()
