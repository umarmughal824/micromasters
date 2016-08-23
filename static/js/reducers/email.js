// @flow
import {
  START_EMAIL_EDIT,
  UPDATE_EMAIL_EDIT,
  CLEAR_EMAIL_EDIT,
  UPDATE_EMAIL_VALIDATION,
} from '../actions/email';
import type { Action } from '../flow/reduxTypes';

export type Email = {
    subject?:   ?string;
    body?:      ?string;
    query?:     ?Object;
};

export type EmailValidationErrors = {
    subject?:   ?string;
    body?:      ?string;
    query?:     ?string;
};

export type EmailEditState = {
  email:  Email;
  errors: EmailValidationErrors;
}

export const INITIAL_EMAIL_STATE: EmailEditState = {
  email:  {},
  errors: {},
};

export const NEW_EMAIL_EDIT: Email = {
  subject:    null,
  body:       null,
  query:      null,
};

export const email = (state: EmailEditState = INITIAL_EMAIL_STATE, action: Action) => {
  switch (action.type) {
  case START_EMAIL_EDIT:
    return { ...state, email: { ...NEW_EMAIL_EDIT, query: action.payload } };
  case UPDATE_EMAIL_EDIT:
    return { ...state, email: action.payload };
  case CLEAR_EMAIL_EDIT:
    return { ...INITIAL_EMAIL_STATE };
  case UPDATE_EMAIL_VALIDATION:
    return { ...state, errors: action.payload };
  default:
    return state;
  }
};
