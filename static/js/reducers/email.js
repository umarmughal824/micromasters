// @flow
import _ from 'lodash';
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
  AllEmailsState,
  EmailState,
  EmailInputs,
} from '../flow/emailTypes';

export const INITIAL_EMAIL_STATE: EmailState = {
  inputs: {},
  params: {},
  validationErrors: {},
  sendError: {},
};
export const INITIAL_ALL_EMAILS_STATE: AllEmailsState = {
  searchResultEmail: INITIAL_EMAIL_STATE,
  courseTeamEmail: INITIAL_EMAIL_STATE
};

export const NEW_EMAIL_EDIT: EmailInputs = {
  subject:    null,
  body:       null,
};

const getEmailType = (payload: string|Object) => (
  // If the action payload is just a string, that indicates the email type
  // Otherwise, the action payload should be an Object with a 'type' property indicating email type
  typeof payload === "string" ? payload : _.get(payload, 'type')
);

function updatedState(state: AllEmailsState, emailType: string, updateObject: Object) {
  let clonedState = _.cloneDeep(state);
  _.merge(clonedState[emailType], updateObject);
  return clonedState;
}

export const email = (state: AllEmailsState = INITIAL_ALL_EMAILS_STATE, action: Action) => {
  let emailType = getEmailType(action.payload);

  switch (action.type) {
  case START_EMAIL_EDIT:
    return updatedState(state, emailType, {
      inputs: NEW_EMAIL_EDIT,
      params: action.payload.params,
      subheading: action.payload.subheading
    });
  case UPDATE_EMAIL_EDIT:
    return updatedState(state, emailType, { inputs: action.payload.inputs });
  case CLEAR_EMAIL_EDIT:
    return updatedState(state, emailType, INITIAL_EMAIL_STATE);
  case UPDATE_EMAIL_VALIDATION:
    return updatedState(state, emailType, { validationErrors: action.payload.errors });

  case INITIATE_SEND_EMAIL:
    return updatedState(state, emailType, { fetchStatus: FETCH_PROCESSING });
  case SEND_EMAIL_SUCCESS:
    return updatedState(state, emailType, { ...INITIAL_ALL_EMAILS_STATE, fetchStatus: FETCH_SUCCESS });
  case SEND_EMAIL_FAILURE:
    return updatedState(state, emailType, { fetchStatus: FETCH_FAILURE, sendError: action.payload.error });
  default:
    return state;
  }
};
