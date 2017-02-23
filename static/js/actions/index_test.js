// @flow
import { assert } from 'chai';

import {
  requestCheckout,
  receiveCheckoutSuccess,
  receiveCheckoutFailure,
  requestCoursePrices,
  receiveCoursePricesSuccess,
  receiveCoursePricesFailure,
  clearCoursePrices,

  REQUEST_CHECKOUT,
  RECEIVE_CHECKOUT_SUCCESS,
  RECEIVE_CHECKOUT_FAILURE,
  REQUEST_COURSE_PRICES,
  RECEIVE_COURSE_PRICES_SUCCESS,
  RECEIVE_COURSE_PRICES_FAILURE,
  CLEAR_COURSE_PRICES,
} from './';
import { assertCreatedActionHelper } from './test_util';
import { ERROR_RESPONSE } from '../constants';

describe('generated index action helpers', () => {
  it('should create all action creators', () => {
    [
      [requestCoursePrices, REQUEST_COURSE_PRICES],
      [receiveCoursePricesSuccess, RECEIVE_COURSE_PRICES_SUCCESS],
      [receiveCoursePricesFailure, RECEIVE_COURSE_PRICES_FAILURE],
      [clearCoursePrices, CLEAR_COURSE_PRICES],
    ].forEach(assertCreatedActionHelper);
  });

  it('requestCheckout passes a course id', () => {
    assert.deepEqual(requestCheckout('course_id'), {
      type: REQUEST_CHECKOUT,
      payload: { courseId: 'course_id' }
    });
  });

  it('receiveCheckoutSuccess passes a url and payload', () => {
    assert.deepEqual(receiveCheckoutSuccess('url', {'pay': 'load'}), {
      type: RECEIVE_CHECKOUT_SUCCESS,
      payload: {
        payload: {'pay': 'load'},
        url: 'url'
      }
    });
  });

  it('receiveCheckoutFailure passes errorInfo', () => {
    assert.deepEqual(receiveCheckoutFailure(ERROR_RESPONSE), {
      type: RECEIVE_CHECKOUT_FAILURE,
      payload: {
        errorInfo: ERROR_RESPONSE
      }
    });
  });
});
