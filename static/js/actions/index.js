// @flow
import type { Dispatch } from 'redux';

import * as api from '../util/api';
import type { CheckoutResponse } from '../flow/checkoutTypes';
import type { APIErrorInfo } from '../flow/generalTypes';
import type { Action, Dispatcher } from '../flow/reduxTypes';
import type { Dashboard } from '../flow/dashboardTypes';

// constants for fetch status (these are not action types)
export const FETCH_FAILURE = 'FETCH_FAILURE';
export const FETCH_SUCCESS = 'FETCH_SUCCESS';
export const FETCH_PROCESSING = 'FETCH_PROCESSING';

// dashboard list actions
export const REQUEST_DASHBOARD = 'REQUEST_DASHBOARD';
const requestDashboard = () => ({ type: REQUEST_DASHBOARD });

export const RECEIVE_DASHBOARD_SUCCESS = 'RECEIVE_DASHBOARD_SUCCESS';
export const receiveDashboardSuccess = (programs: Object[]): Action => ({
  type: RECEIVE_DASHBOARD_SUCCESS,
  payload: { programs }
});

export const RECEIVE_DASHBOARD_FAILURE = 'RECEIVE_DASHBOARD_FAILURE';
export const receiveDashboardFailure = (errorInfo: APIErrorInfo): Action => ({
  type: RECEIVE_DASHBOARD_FAILURE,
  payload: { errorInfo }
});

export const CLEAR_DASHBOARD = 'CLEAR_DASHBOARD';
export const clearDashboard = () => ({ type: CLEAR_DASHBOARD });

export function fetchDashboard(): Dispatcher<Dashboard> {
  return (dispatch: Dispatch) => {
    dispatch(requestDashboard());
    return api.getDashboard().
      then(dashboard => dispatch(receiveDashboardSuccess(dashboard))).
      catch(error => {
        dispatch(receiveDashboardFailure(error));
        // the exception is assumed handled and will not be propagated
      });
  };
}

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
