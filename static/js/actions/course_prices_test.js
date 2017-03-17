// @flow
import {
  requestCoursePrices,
  receiveCoursePricesSuccess,
  receiveCoursePricesFailure,
  clearCoursePrices,

  REQUEST_COURSE_PRICES,
  RECEIVE_COURSE_PRICES_SUCCESS,
  RECEIVE_COURSE_PRICES_FAILURE,
  CLEAR_COURSE_PRICES,
} from './course_prices';
import { assertWithUsernameActionHelper } from './test_util';

describe('generated index action helpers', () => {
  it('should create all action creators', () => {
    [
      [requestCoursePrices, REQUEST_COURSE_PRICES],
      [receiveCoursePricesSuccess, RECEIVE_COURSE_PRICES_SUCCESS],
      [receiveCoursePricesFailure, RECEIVE_COURSE_PRICES_FAILURE],
      [clearCoursePrices, CLEAR_COURSE_PRICES],
    ].forEach(assertWithUsernameActionHelper);
  });
});
