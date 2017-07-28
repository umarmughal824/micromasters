// @flow
/* global SETTINGS: false */
import type { Dispatch } from 'redux';
import { createAction } from 'redux-actions';

import * as api from '../lib/api';
import type { Dispatcher } from '../flow/reduxTypes';

export const REQUEST_GET_HAS_PAYMENTS = 'REQUEST_GET_HAS_PAYMENTS';
export const requestGetHasPayments = createAction(REQUEST_GET_HAS_PAYMENTS);

export const RECEIVE_GET_HAS_PAYMENTS_SUCCESS = 'RECEIVE_GET_HAS_PAYMENTS_SUCCESS';
export const receiveGetHasPaymentsSuccess = createAction(RECEIVE_GET_HAS_PAYMENTS_SUCCESS);

export function fetchHasPayments(): Dispatcher<void> {
  return (dispatch: Dispatch) => {
    dispatch(requestGetHasPayments());
    return api.getProgramPayment().
      then(payments => {
        dispatch(receiveGetHasPaymentsSuccess(payments));
      });
  };
}
