// @flow
import {
  START_CALCULATOR_EDIT,
  CLEAR_CALCULATOR_EDIT,
  UPDATE_CALCULATOR_EDIT,
  UPDATE_CALCULATOR_VALIDATION,
  REQUEST_ADD_FINANCIAL_AID,
  RECEIVE_ADD_FINANCIAL_AID_SUCCESS,
  RECEIVE_ADD_FINANCIAL_AID_FAILURE,
  REQUEST_SKIP_FINANCIAL_AID,
  RECEIVE_SKIP_FINANCIAL_AID_FAILURE,
  RECEIVE_SKIP_FINANCIAL_AID_SUCCESS,
} from '../actions/financial_aid';
import {
  FETCH_FAILURE,
  FETCH_PROCESSING,
  FETCH_SUCCESS,
} from '../actions';
import type { Action } from '../flow/reduxTypes';
import _ from 'lodash';

export const INITIAL_FINANCIAL_AID_STATE = {};

export const FINANCIAL_AID_EDIT = {
  income:       "",
  currency:     "",
  checkBox:     false,
  fetchStatus:  null,
  programId:    null,
  validation:   {},
  fetchError:   null,
};

export type FinancialAidValidation = {
  income?: string,
  currency?: string,
  checkBox?: string,
};

export type FetchError = {
  message?:  string,
  code?:     number,
};


export type FinancialAidState = {
  income?:      string,
  currency?:    string,
  checkBox?:    boolean,
  fetchStatus?: string,
  programId?:   number,
  validation?:  FinancialAidValidation,
  fetchError?:  FetchError,
};

export const financialAid = (state: FinancialAidState = INITIAL_FINANCIAL_AID_STATE, action: Action) => {
  switch (action.type) {
  case START_CALCULATOR_EDIT:
    return { ...FINANCIAL_AID_EDIT, programId: action.payload };
  case CLEAR_CALCULATOR_EDIT:
    return FINANCIAL_AID_EDIT;
  case UPDATE_CALCULATOR_EDIT:
    return { ...state, ...action.payload };
  case UPDATE_CALCULATOR_VALIDATION: {
    let clone = _.clone(state);
    clone.validation = action.payload;
    return clone;
  }
  case REQUEST_ADD_FINANCIAL_AID:
    return {
      ...state,
      fetchStatus: FETCH_PROCESSING,
      fetchError: null,
      validation: {},
    };
  case RECEIVE_ADD_FINANCIAL_AID_SUCCESS:
    return { ...state, fetchStatus: FETCH_SUCCESS };
  case RECEIVE_ADD_FINANCIAL_AID_FAILURE:
    return { ...state, fetchStatus: FETCH_FAILURE, fetchError: action.payload };
  case REQUEST_SKIP_FINANCIAL_AID:
    return { ...state, fetchStatus: FETCH_PROCESSING };
  case RECEIVE_SKIP_FINANCIAL_AID_SUCCESS:
    return { ...state, fetchStatus: FETCH_SUCCESS };
  case RECEIVE_SKIP_FINANCIAL_AID_FAILURE:
    return { ...state, fetchStatus: FETCH_FAILURE};
  default:
    return state;
  }
};
