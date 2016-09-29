// @flow
import {
  START_EMAIL_EDIT,
  UPDATE_EMAIL_EDIT,
  CLEAR_EMAIL_EDIT,
  UPDATE_EMAIL_VALIDATION,
  INITIATE_SEND_EMAIL,
  SEND_EMAIL_SUCCESS,
  SEND_EMAIL_FAILURE
} from '../actions/email';
import {
  FETCH_FAILURE,
  FETCH_SUCCESS,
  FETCH_PROCESSING
} from '../actions';
import type { Action } from '../flow/reduxTypes';
import type {
  Email,
  EmailState
} from '../flow/emailTypes';

export const INITIAL_EMAIL_STATE: EmailState = {
  email:  {},
  validationErrors: {},
  sendError: {},
};

export const NEW_EMAIL_EDIT: Email = {
  subject:    null,
  body:       null,
  query:      null,
};

export const email = (state: EmailState = INITIAL_EMAIL_STATE, action: Action) => {
  switch (action.type) {
  case START_EMAIL_EDIT:
    return { ...state, email: { ...NEW_EMAIL_EDIT, query: action.payload } };
  case UPDATE_EMAIL_EDIT:
    return { ...state, email: action.payload };
  case CLEAR_EMAIL_EDIT:
    return { ...INITIAL_EMAIL_STATE };
  case UPDATE_EMAIL_VALIDATION:
    return { ...state, validationErrors: action.payload };
  case INITIATE_SEND_EMAIL:
    return { ...state, fetchStatus: FETCH_PROCESSING };
  case SEND_EMAIL_SUCCESS:
    return { ...INITIAL_EMAIL_STATE, fetchStatus: FETCH_SUCCESS };
  case SEND_EMAIL_FAILURE:
    return { ...state, fetchStatus: FETCH_FAILURE, sendError: action.payload };
  default:
    return state;
  }
};
