// @flow
import React from 'react';

import {
  makeAmountMessage,
  makeCouponReason,
} from '../../lib/coupon';
import {
  COUPON_AMOUNT_TYPE_FIXED_DISCOUNT,
  COUPON_AMOUNT_TYPE_PERCENT_DISCOUNT,
  COUPON_CONTENT_TYPE_PROGRAM,
  COUPON_CONTENT_TYPE_COURSE,
} from '../../constants';
import type { Coupon } from '../../flow/couponTypes';

export const couponMessageText = (coupon: Coupon) => {
  let isDiscount = (
    coupon.amount_type === COUPON_AMOUNT_TYPE_PERCENT_DISCOUNT ||
    coupon.amount_type === COUPON_AMOUNT_TYPE_FIXED_DISCOUNT
  );

  if (isDiscount) {
    if (coupon.content_type === COUPON_CONTENT_TYPE_PROGRAM) {
      return `You will get ${makeAmountMessage(coupon)} off the cost for each course in this program`;
    } else if (coupon.content_type === COUPON_CONTENT_TYPE_COURSE) {
      return `You will get ${makeAmountMessage(coupon)} off the cost for this course`;
    }
  } else {
    if (coupon.content_type === COUPON_CONTENT_TYPE_PROGRAM) {
      return `All courses are set to the discounted price of ${makeAmountMessage(coupon)}`;
    } else if (coupon.content_type === COUPON_CONTENT_TYPE_COURSE) {
      return `This course is set to the discounted price of ${makeAmountMessage(coupon)}`;
    }
  }
  return '';
};


export default class CouponMessage extends React.Component {
  props: {
    coupon: Coupon,
  };

  render() {
    const { coupon } = this.props;

    let message = couponMessageText(coupon);

    if (message === "") {
      return null;
    }

    let formattedMessage = <span>
      { message }
    </span>;

    return <div className="coupon-message">
      {formattedMessage}{makeCouponReason(coupon)}.
      </div>;
  }
}
