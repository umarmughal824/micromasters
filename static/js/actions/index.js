// @flow
/* global SETTINGS: false */
import type { Dispatch } from 'redux';
import { createAction } from 'redux-actions';

import * as api from '../lib/api';
import type { CheckoutResponse } from '../flow/checkoutTypes';
import type { APIErrorInfo } from '../flow/generalTypes';
import type { Action, Dispatcher } from '../flow/reduxTypes';
import type { CoursePrices } from '../flow/dashboardTypes';

// constants for fetch status (these are not action types)
export const FETCH_FAILURE = 'FETCH_FAILURE';
export const FETCH_SUCCESS = 'FETCH_SUCCESS';
export const FETCH_PROCESSING = 'FETCH_PROCESSING';


export const REQUEST_CHECKOUT = 'REQUEST_CHECKOUT';
export const requestCheckout = (courseId: string) => ({
  type: REQUEST_CHECKOUT,
  payload: { courseId }
});

export function checkout(courseId: string): Dispatcher<CheckoutResponse> {
  return (dispatch: Dispatch) => {
    dispatch(requestCheckout(courseId));
    return api.checkout(courseId).
      then(response => {
        const {url, payload} = response;
        dispatch(receiveCheckoutSuccess(url, payload));
        return Promise.resolve(response);
      }).catch(error => {
        dispatch(receiveCheckoutFailure(error));
      });
  };
}

export const RECEIVE_CHECKOUT_SUCCESS = 'RECEIVE_CHECKOUT_SUCCESS';
export const receiveCheckoutSuccess = (url: string, payload: Object): Action => ({
  type: RECEIVE_CHECKOUT_SUCCESS,
  payload: { url, payload }
});
export const RECEIVE_CHECKOUT_FAILURE = 'RECEIVE_CHECKOUT_FAILURE';
export const receiveCheckoutFailure = (errorInfo: APIErrorInfo): Action => ({
  type: RECEIVE_CHECKOUT_FAILURE,
  payload: { errorInfo }
});

// course price actions
export const REQUEST_COURSE_PRICES = 'REQUEST_COURSE_PRICES';
export const requestCoursePrices = createAction(REQUEST_COURSE_PRICES);

export const RECEIVE_COURSE_PRICES_SUCCESS = 'RECEIVE_COURSE_PRICES_SUCCESS';
export const receiveCoursePricesSuccess = createAction(RECEIVE_COURSE_PRICES_SUCCESS);

export const RECEIVE_COURSE_PRICES_FAILURE = 'RECEIVE_COURSE_PRICES_FAILURE';
export const receiveCoursePricesFailure = createAction(RECEIVE_COURSE_PRICES_FAILURE);

export const CLEAR_COURSE_PRICES = 'CLEAR_COURSE_PRICES';
export const clearCoursePrices = createAction(CLEAR_COURSE_PRICES);

export function fetchCoursePrices(): Dispatcher<CoursePrices> {
  return (dispatch: Dispatch) => {
    dispatch(requestCoursePrices());
    return api.getCoursePrices().
      then(coursePrices => dispatch(receiveCoursePricesSuccess(coursePrices))).
      catch(error => {
        dispatch(receiveCoursePricesFailure(error));
        // the exception is assumed handled and will not be propagated
      });
  };
}
