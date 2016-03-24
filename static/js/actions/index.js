import { sendGoogleAnalyticsEvent } from '../util/util';
import { createAction } from 'redux-actions';
import * as api from '../util/api';

export const UPDATE_CHECKBOX = 'UPDATE_CHECKBOX';
export const REQUEST_COURSE_LIST = 'REQUEST_COURSE_LIST';
export const RECEIVE_COURSE_LIST_SUCCESS = 'RECEIVE_COURSE_LIST_SUCCESS';
export const RECEIVE_COURSE_LIST_FAILURE = 'RECEIVE_COURSE_LIST_FAILURE';

export const CLEAR_COURSE_LIST = 'CLEAR_COURSE_LIST';

export const FETCH_FAILURE = 'FETCH_FAILURE';
export const FETCH_SUCCESS = 'FETCH_SUCCESS';
export const FETCH_PROCESSING = 'FETCH_PROCESSING';

export const updateCheckbox = createAction(
  UPDATE_CHECKBOX, checked =>  ({ checked }));

const requestCourseList = createAction(REQUEST_COURSE_LIST);


export const receiveCourseListSuccess = createAction(
  RECEIVE_COURSE_LIST_SUCCESS, courseList => ({courseList}));

const receiveCourseListFailure = createAction(RECEIVE_COURSE_LIST_FAILURE);

export const clearCourseList = createAction(CLEAR_COURSE_LIST);


export function fetchCourseList() {
  return dispatch => {
    dispatch(requestCourseList());
    return api.getCourseList().
      then(json => dispatch(receiveCourseListSuccess(json))).
      catch(() => dispatch(receiveCourseListFailure()));
  };
}
