// @flow
import type { Dispatch } from 'redux';
import { createAction } from 'redux-actions';

import type { Dispatcher } from '../flow/reduxTypes';
import type {
  EmailSendResponse,
} from '../flow/emailTypes';
import {
  SEARCH_EMAIL_TYPE,
  COURSE_EMAIL_TYPE
} from '../components/email/constants';
import * as api from '../lib/api';

export const START_EMAIL_EDIT = 'START_EMAIL_EDIT';
export const startEmailEdit = createAction(START_EMAIL_EDIT);

export const UPDATE_EMAIL_EDIT = 'UPDATE_EMAIL_EDIT';
export const updateEmailEdit = createAction(UPDATE_EMAIL_EDIT);

export const CLEAR_EMAIL_EDIT = 'CLEAR_EMAIL_EDIT';
export const clearEmailEdit = createAction(CLEAR_EMAIL_EDIT);

export const UPDATE_EMAIL_VALIDATION = 'UPDATE_EMAIL_VALIDATION';
export const updateEmailValidation = createAction(UPDATE_EMAIL_VALIDATION);

export const INITIATE_SEND_EMAIL = 'INITIATE_SEND_EMAIL';
export const initiateSendEmail = createAction(INITIATE_SEND_EMAIL);

export const SEND_EMAIL_SUCCESS = 'SEND_EMAIL_SUCCESS';
export const sendEmailSuccess = createAction(SEND_EMAIL_SUCCESS);

export const SEND_EMAIL_FAILURE = 'SEND_EMAIL_FAILURE';
export const sendEmailFailure = createAction(SEND_EMAIL_FAILURE);

export function sendSearchResultMail(
  subject: string,
  body: string,
  searchRequest: Object
): Dispatcher<EmailSendResponse> {
  return (dispatch: Dispatch) => {
    dispatch(initiateSendEmail(SEARCH_EMAIL_TYPE));
    return api.sendSearchResultMail(subject, body, searchRequest).
      then(response => {
        dispatch(sendEmailSuccess(SEARCH_EMAIL_TYPE));
        return Promise.resolve(response);
      }).catch(error => {
        dispatch(sendEmailFailure({type: SEARCH_EMAIL_TYPE, error: error}));
      });
  };
}

export function sendCourseTeamMail(
  subject: string,
  body: string,
  courseId: number
): Dispatcher<EmailSendResponse> {
  return (dispatch: Dispatch) => {
    dispatch(initiateSendEmail(COURSE_EMAIL_TYPE));
    return api.sendCourseTeamMail(subject, body, courseId).
      then(response => {
        dispatch(sendEmailSuccess(COURSE_EMAIL_TYPE));
        return Promise.resolve(response);
      }).catch(error => {
        dispatch(sendEmailFailure({type: COURSE_EMAIL_TYPE, error: error}));
      });
  };
}
