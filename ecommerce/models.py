"""
Models for storing ecommerce data
"""
from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.contrib.postgres.fields import JSONField
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import (
    Model,
    SET_NULL,
)
from django.db.models.fields import (
    BooleanField,
    CharField,
    DateTimeField,
    DecimalField,
    PositiveIntegerField,
    TextField,
)
from django.db.models.fields.related import (
    ForeignKey,
)

from courses.models import (
    Course,
    CourseRun,
    Program,
)
from ecommerce.exceptions import EcommerceModelException
from micromasters.models import (
    AuditableModel,
    AuditModel,
)
from micromasters.utils import serialize_model_object


class Order(AuditableModel):
    """
    An order for financial aid programs
    """
    FULFILLED = 'fulfilled'
    FAILED = 'failed'
    CREATED = 'created'
    REFUNDED = 'refunded'

    STATUSES = [CREATED, FULFILLED, FAILED, REFUNDED]

    user = ForeignKey(User)
    status = CharField(
        choices=[(status, status) for status in STATUSES],
        default=CREATED,
        max_length=30,
        db_index=True,
    )

    created_at = DateTimeField(auto_now_add=True)
    modified_at = DateTimeField(auto_now=True)
    total_price_paid = DecimalField(decimal_places=2, max_digits=20)

    def __str__(self):
        """Description for Order"""
        return "Order {}, status={} for user={}".format(self.id, self.status, self.user)

    @classmethod
    def get_audit_class(cls):
        return OrderAudit

    def to_dict(self):
        """
        Get a serialized representation of the Order and any attached Lines
        """
        data = serialize_model_object(self)
        data['lines'] = [serialize_model_object(line) for line in self.line_set.all()]
        return data


class OrderAudit(AuditModel):
    """
    Audit model for Order
    """
    order = ForeignKey(Order, null=True, on_delete=SET_NULL)

    @classmethod
    def get_related_field_name(cls):
        return 'order'


class Line(Model):
    """
    A line in an order. This contains information about a specific item to be purchased.
    """
    course_key = TextField(db_index=True)
    order = ForeignKey(Order)
    price = DecimalField(decimal_places=2, max_digits=20)
    description = TextField(blank=True, null=True)

    created_at = DateTimeField(auto_now_add=True)
    modified_at = DateTimeField(auto_now=True)

    def __str__(self):
        """Description for Line"""
        return "Line for order {}, course_key={}, price={}".format(self.order.id, self.course_key, self.price)


class Receipt(Model):
    """
    The contents of the message from CyberSource about an Order fulfillment or cancellation
    """
    order = ForeignKey(Order, null=True)
    data = JSONField()

    created_at = DateTimeField(auto_now_add=True)
    modified_at = DateTimeField(auto_now=True)

    def __str__(self):
        """Description of Receipt"""
        if self.order:
            return "Receipt for order {}".format(self.order.id)
        else:
            return "Receipt with no attached order"


class CoursePrice(Model):
    """
    Information about a course run's price and other ecommerce info
    """
    course_run = ForeignKey(CourseRun)
    price = DecimalField(decimal_places=2, max_digits=20)
    is_valid = BooleanField(default=False)

    created_at = DateTimeField(auto_now_add=True)
    modified_at = DateTimeField(auto_now=True)

    def clean(self):
        """
        Override clean to provide user-friendly validation around CoursePrice.is_valid
        """
        if self.is_valid and CoursePrice.objects.filter(
                course_run=self.course_run,
                is_valid=True
        ).exclude(id=self.id).exists():
            raise ValidationError({
                'is_valid': 'Cannot have two CoursePrice objects for same CourseRun marked is_valid',
            })

    @transaction.atomic
    def save(self, *args, **kwargs):
        """
        Override save to make sure is_valid is only set per one CourseRun
        """
        if self.is_valid and CoursePrice.objects.filter(
                course_run=self.course_run,
                is_valid=True
        ).exclude(id=self.id).exists():
            raise EcommerceModelException("Cannot have two CoursePrice objects for same CourseRun marked is_valid")

        super(CoursePrice, self).save(*args, **kwargs)

    def __str__(self):
        """Description for CoursePrice"""
        return "CoursePrice for {}, price={}, is_valid={}".format(self.course_run, self.price, self.is_valid)


class Coupon(Model):
    """
    Model for a coupon. This stores the discount for the coupon, how many people can use it, and how many times
    a person can use it.

    When a coupon is redeemed by a purchaser the counter on this object is decremented
    and a UserCoupon object is created for that particular purchaser.
    """
    PERCENT_DISCOUNT = 'percent-discount'
    FIXED_DISCOUNT = 'fixed-discount'

    AMOUNT_TYPES = [PERCENT_DISCOUNT, FIXED_DISCOUNT]

    coupon_code = TextField(
        null=True,
        blank=True,
        help_text="""The coupon code used for redemption by the purchaser in the user interface.
    If blank, the purchaser may not redeem this coupon through the user interface,
    though it may be redeemed in their name by an administrator.""",
    )
    content_type = ForeignKey(
        ContentType,
        on_delete=SET_NULL,
        null=True,
        help_text="content_object is a link to either a Course, CourseRun, or a Program",
    )
    object_id = PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    amount_type = CharField(
        choices=[(_type, _type) for _type in AMOUNT_TYPES],
        max_length=30,
        help_text="Whether amount is a percent or fixed discount",
    )
    amount = DecimalField(
        decimal_places=2,
        max_digits=20,
        help_text="Either a number from 0 to 1 representing a percent, or the fixed value for discount",
    )

    num_coupons_available = PositiveIntegerField(
        null=False,
        help_text="Number of people this coupon can be redeemed by",
    )
    num_redemptions_per_user = PositiveIntegerField(
        null=False,
        help_text="Number of times a person can redeem a coupon",
    )
    expiration_date = DateTimeField(
        null=True,
        blank=True,
        help_text="If set, the coupons will not be redeemable after this time",
    )
    activation_date = DateTimeField(
        null=True,
        blank=True,
        help_text="If set, the coupons will not be redeemable before this time",
    )
    enabled = BooleanField(default=True, help_text="If true, coupons are presently redeemable")

    def clean(self):
        """Validate amount and content_object"""
        super().clean()

        if self.content_type.model_class() not in (
                Course,
                CourseRun,
                Program,
        ):
            raise ValidationError("content_object must be of type Course, CourseRun, or Program")

        if self.amount_type == self.PERCENT_DISCOUNT:
            if self.amount is None or not 0 <= self.amount <= 1:
                raise ValidationError("amount must be between 0 and 1 if amount_type is {}".format(
                    self.PERCENT_DISCOUNT
                ))

        if self.amount_type not in self.AMOUNT_TYPES:
            raise ValidationError("amount_type must be one of {}".format(", ".join(self.AMOUNT_TYPES)))

    def save(self, *args, **kwargs):
        """Override save to do certain validations"""
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        """Description for Coupon"""
        return "Coupon {amount_type} {amount} for {product}, {num_coupons_available} left".format(
            amount_type=self.amount_type,
            amount=self.amount,
            product=self.content_object,
            num_coupons_available=self.num_coupons_available,
        )


class RedeemedCoupon(Model):
    """
    Model for coupon which has been used in a purchase by a user.
    """
    order = ForeignKey(Order, on_delete=SET_NULL, null=True)
    coupon = ForeignKey(Coupon, on_delete=SET_NULL, null=True)

    class Meta:
        unique_together = ('order', 'coupon',)

    def __str__(self):
        """Description for RedeemedCoupon"""
        return "RedeemedCoupon for {order}, {coupon}".format(
            order=self.order,
            coupon=self.coupon,
        )
