// @flow

import {
  FETCH_SUCCESS,
  FETCH_PROCESSING
} from '../actions';
import {
  REQUEST_GET_HAS_PAYMENTS,
  RECEIVE_GET_HAS_PAYMENTS_SUCCESS
} from '../actions/payment';
import type { ProgramPaymentState } from '../flow/dashboardTypes';
import type { Action } from '../flow/reduxTypes';

export const INITIAL_PAYMENT_STATE: ProgramPaymentState = {
  payments: []
};

export const programPayment = (state: ProgramPaymentState = INITIAL_PAYMENT_STATE, action: Action<any, null>) => {
  switch (action.type) {
  case REQUEST_GET_HAS_PAYMENTS:
    return { ...state, getStatus: FETCH_PROCESSING };
  case RECEIVE_GET_HAS_PAYMENTS_SUCCESS:
    return {
      ...state,
      getStatus: FETCH_SUCCESS,
      payments: action.payload,
    };
  default:
    return state;
  }
};
