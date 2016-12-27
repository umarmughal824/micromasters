"""
Tests for ecommerce models
"""

from django.core.exceptions import ValidationError
from django.test import (
    TestCase,
    override_settings,
)

from courses.factories import CourseRunFactory
from ecommerce.exceptions import EcommerceModelException
from ecommerce.factories import (
    CouponFactory,
    CoursePriceFactory,
    LineFactory,
    OrderFactory,
    ReceiptFactory,
)
from ecommerce.models import Coupon
from micromasters.utils import serialize_model_object
from profiles.factories import UserFactory


# pylint: disable=no-self-use
@override_settings(CYBERSOURCE_SECURITY_KEY='fake')
class OrderTests(TestCase):
    """
    Tests for Order, Line, and Receipt
    """

    def test_order_str(self):
        """Test Order.__str__"""
        order = LineFactory.create().order
        assert str(order) == "Order {}, status={} for user={}".format(order.id, order.status, order.user)

    def test_line_str(self):
        """Test Line.__str__"""
        line = LineFactory.create()
        assert str(line) == "Line for order {}, course_key={}, price={}".format(
            line.order.id,
            line.course_key,
            line.price,
        )

    def test_receipt_str_with_order(self):
        """Test Receipt.__str__ with an order"""
        receipt = ReceiptFactory.create()
        assert str(receipt) == "Receipt for order {}".format(receipt.order.id if receipt.order else None)

    def test_receipt_str_no_order(self):
        """Test Receipt.__str__ with no order"""
        receipt = ReceiptFactory.create(order=None)
        assert str(receipt) == "Receipt with no attached order"

    def test_to_dict(self):
        """
        Test Order.to_dict()
        """
        order = OrderFactory.create()
        lines = [LineFactory.create(order=order) for _ in range(5)]
        data = order.to_dict()
        lines_data = data.pop('lines')
        assert serialize_model_object(order) == data
        assert lines_data == [serialize_model_object(line) for line in lines]


class CoursePriceTests(TestCase):
    """
    Tests for CoursePrice
    """

    def test_create_no_two_is_valid(self):
        """
        Two is_valid CoursePrice instances on the same model are not valid
        """
        price = CoursePriceFactory.create(is_valid=True)
        with self.assertRaises(EcommerceModelException) as ex:
            CoursePriceFactory.create(is_valid=True, course_run=price.course_run)

        assert ex.exception.args[0] == "Cannot have two CoursePrice objects for same CourseRun marked is_valid"

    def test_update_no_two_is_valid(self):
        """
        A CoursePrice instance shouldn't be able to be updated to have two is_valid instances for a CourseRun
        """
        price = CoursePriceFactory.create(is_valid=False)
        CoursePriceFactory.create(is_valid=True, course_run=price.course_run)
        with self.assertRaises(EcommerceModelException) as ex:
            price.is_valid = True
            price.save()

        assert ex.exception.args[0] == "Cannot have two CoursePrice objects for same CourseRun marked is_valid"

    def test_clean_no_two_is_valid(self):
        """
        A CoursePrice instance should raise a ValidationError if another CoursePrice for the same CourseRun
        is already marked is_valid
        """
        price = CoursePriceFactory.create(is_valid=False)
        CoursePriceFactory.create(is_valid=True, course_run=price.course_run)
        with self.assertRaises(ValidationError) as ex:
            price.is_valid = True
            price.clean()

        assert ex.exception.args[0] == {
            'is_valid': "Cannot have two CoursePrice objects for same CourseRun marked is_valid",
        }

    def test_update_one_is_valid(self):
        """
        If only one CoursePrice has is_valid=True, we should be able to update it without problems
        """
        price = CoursePriceFactory.create(is_valid=True)
        price.price = 345
        price.clean()
        price.save()

    def test_two_different_courseruns(self):
        """
        Two CoursePrices can have is_valid=True for two different CourseRuns
        """
        CoursePriceFactory.create(is_valid=True)
        CoursePriceFactory.create(is_valid=True)

    def test_str(self):
        """
        Test output of __str__
        """
        course_price = CoursePriceFactory.create()
        assert str(course_price) == "CoursePrice for {}, price={}, is_valid={}".format(
            course_price.course_run, course_price.price, course_price.is_valid
        )


class CouponTests(TestCase):
    """Tests for Coupon"""

    def test_validate_content_object(self):
        """
        Coupon.content_object should only accept Course, CourseRun, or Program
        """
        course_run = CourseRunFactory.create()
        user = UserFactory.create()
        coupons = []
        for obj in (course_run, course_run.course, course_run.course.program):
            coupons.append(CouponFactory.create(content_object=obj))

        with self.assertRaises(ValidationError) as ex:
            CouponFactory.create(content_object=user)
        assert ex.exception.args[0]['__all__'][0].args[0] == (
            'content_object must be of type Course, CourseRun, or Program'
        )

    def test_validate_amount(self):
        """
        Coupon.amount should be between 0 and 1 if amount_type is percent-discount
        """
        with self.assertRaises(ValidationError) as ex:
            CouponFactory.create(amount=3, amount_type=Coupon.PERCENT_DISCOUNT)
        assert ex.exception.args[0]['__all__'][0].args[0] == (
            'amount must be between 0 and 1 if amount_type is percent-discount'
        )

    def test_validate_amount_type(self):
        """
        Coupon.amount_type should be one of Coupon.AMOUNT_TYPES
        """
        with self.assertRaises(ValidationError) as ex:
            CouponFactory.create(amount_type='xyz')
        assert ex.exception.args[0]['__all__'][0].args[0] == (
            'amount_type must be one of percent-discount, fixed-discount'
        )
