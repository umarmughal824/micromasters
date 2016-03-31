import * as api from '../util/api';

// course list actions
export const REQUEST_COURSE_LIST = 'REQUEST_COURSE_LIST';
export const RECEIVE_COURSE_LIST_SUCCESS = 'RECEIVE_COURSE_LIST_SUCCESS';
export const RECEIVE_COURSE_LIST_FAILURE = 'RECEIVE_COURSE_LIST_FAILURE';
export const CLEAR_COURSE_LIST = 'CLEAR_COURSE_LIST';

export const REQUEST_USER_PROFILE = 'REQUEST_USER_PROFILE';
export const RECEIVE_USER_PROFILE_SUCCESS = 'RECEIVE_USER_PROFILE_SUCCESS';
export const RECEIVE_USER_PROFILE_FAILURE = 'RECEIVE_USER_PROFILE_FAILURE';
export const CLEAR_PROFILE = 'CLEAR_PROFILE';

// constants for fetch status (these are not action types)
export const FETCH_FAILURE = 'FETCH_FAILURE';
export const FETCH_SUCCESS = 'FETCH_SUCCESS';
export const FETCH_PROCESSING = 'FETCH_PROCESSING';

const requestCourseList = () => ({ type: REQUEST_COURSE_LIST });
export const receiveCourseListSuccess = (courseList, programList) => ({
  type: RECEIVE_COURSE_LIST_SUCCESS,
  payload: {
    courseList,
    programList,
  }
});
const receiveCourseListFailure = () => ({ type: RECEIVE_COURSE_LIST_FAILURE });
export const clearCourseList = () => ({ type: CLEAR_COURSE_LIST });

export function fetchCourseList() {
  return dispatch => {
    dispatch(requestCourseList());
    let courseListPromise = api.getCourseList();
    let programListPromise = api.getProgramList();
    return Promise.all([courseListPromise, programListPromise]).
      then(values => dispatch(receiveCourseListSuccess(...values))).
      catch(() => dispatch(receiveCourseListFailure()));
  };
}

const requestUserProfile = () => ({ type: REQUEST_USER_PROFILE });

export const receiveUserProfileSuccess = profile =>({
  type: RECEIVE_USER_PROFILE_SUCCESS,
  payload: { profile }
});

const receiveUserProfileFailure = () => ({ type: RECEIVE_USER_PROFILE_FAILURE });

export const clearProfile = () => ({ type: CLEAR_PROFILE });

export function fetchUserProfile(username) {
  return dispatch => {
    dispatch(requestUserProfile());
    return api.getUserProfile(username).
      then(json => dispatch(receiveUserProfileSuccess(json))).
      catch(()=> dispatch(receiveUserProfileFailure()));
  };
}

// dashboard list actions
export const REQUEST_DASHBOARD = 'REQUEST_DASHBOARD';
export const RECEIVE_DASHBOARD_SUCCESS = 'RECEIVE_DASHBOARD_SUCCESS';
export const RECEIVE_DASHBOARD_FAILURE = 'RECEIVE_DASHBOARD_FAILURE';
export const CLEAR_DASHBOARD = 'CLEAR_DASHBOARD';

const requestDashboard = () => ({ type: REQUEST_DASHBOARD });
export const receiveDashboardSuccess = dashboard => ({
  type: RECEIVE_DASHBOARD_SUCCESS,
  payload: dashboard
});
const receiveDashboardFailure = () => ({ type: RECEIVE_DASHBOARD_FAILURE });
export const clearDashboard = () => ({ type: CLEAR_DASHBOARD });

export function fetchDashboard() {
  return dispatch => {
    dispatch(requestDashboard());
    return api.getDashboard().
      then(dashboard => dispatch(receiveDashboardSuccess(dashboard))).
      catch(() => dispatch(receiveDashboardFailure()));
  };
}
