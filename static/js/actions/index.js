import { sendGoogleAnalyticsEvent } from '../util/util';
import * as api from '../util/api';

export const REQUEST_COURSE_LIST = 'REQUEST_COURSE_LIST';
export const RECEIVE_COURSE_LIST_SUCCESS = 'RECEIVE_COURSE_LIST_SUCCESS';
export const RECEIVE_COURSE_LIST_FAILURE = 'RECEIVE_COURSE_LIST_FAILURE';

export const CLEAR_COURSE_LIST = 'CLEAR_COURSE_LIST';

export const FETCH_FAILURE = 'FETCH_FAILURE';
export const FETCH_SUCCESS = 'FETCH_SUCCESS';
export const FETCH_PROCESSING = 'FETCH_PROCESSING';

const requestCourseList = () => ({ type: REQUEST_COURSE_LIST });


export const receiveCourseListSuccess = courseList => ({
  type: RECEIVE_COURSE_LIST_SUCCESS,
  payload: { courseList }
});

const receiveCourseListFailure = () => ({ type: RECEIVE_COURSE_LIST_FAILURE });

export const clearCourseList = () => ({ type: CLEAR_COURSE_LIST });


export function fetchCourseList() {
  return dispatch => {
    dispatch(requestCourseList());
    return api.getCourseList().
      then(json => dispatch(receiveCourseListSuccess(json))).
      catch(() => dispatch(receiveCourseListFailure()));
  };
}
