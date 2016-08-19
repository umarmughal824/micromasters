// @flow
import {
  START_EMAIL_EDIT,
  UPDATE_EMAIL_EDIT,
  CLEAR_EMAIL_EDIT,
} from '../actions/email';
import type { Action } from '../flow/reduxTypes';

export type EmailEditState = {
  subject?:   ?string;
  body?:      ?string;
  query?:     ?Object;
};

export const INITIAL_EMAIL_STATE: EmailEditState = {};

export const NEW_EMAIL_EDIT: EmailEditState = {
  subject:    null,
  body:       null,
  query:      null,
};

export const email = (state: EmailEditState = INITIAL_EMAIL_STATE, action: Action) => {
  switch (action.type) {
  case START_EMAIL_EDIT:
    return { ...state, ...NEW_EMAIL_EDIT, ...{query: action.payload} };
  case UPDATE_EMAIL_EDIT:
    return { ...state, ...action.payload };
  case CLEAR_EMAIL_EDIT:
    return { ...INITIAL_EMAIL_STATE};
  default:
    return state;
  }
};
