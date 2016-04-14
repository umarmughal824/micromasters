/* global SETTINGS: false */
import { combineReducers } from 'redux';
import {
  REQUEST_COURSE_LIST,
  RECEIVE_COURSE_LIST_SUCCESS,
  RECEIVE_COURSE_LIST_FAILURE,
  CLEAR_COURSE_LIST,

  REQUEST_USER_PROFILE,
  RECEIVE_USER_PROFILE_SUCCESS,
  RECEIVE_USER_PROFILE_FAILURE,
  CLEAR_PROFILE,
  UPDATE_PROFILE,

  REQUEST_DASHBOARD,
  RECEIVE_DASHBOARD_SUCCESS,
  RECEIVE_DASHBOARD_FAILURE,
  CLEAR_DASHBOARD,

  FETCH_FAILURE,
  FETCH_PROCESSING,
  FETCH_SUCCESS,
} from '../actions';

const INITIAL_COURSE_LIST_STATE = {
  courseList: [],
  programList: []
};

export const courseList = (state = INITIAL_COURSE_LIST_STATE, action) => {
  switch (action.type) {
  case REQUEST_COURSE_LIST:
    return Object.assign({}, state, {
      fetchStatus: FETCH_PROCESSING
    });
  case RECEIVE_COURSE_LIST_SUCCESS:
    return Object.assign({}, state, {
      fetchStatus: FETCH_SUCCESS,
      courseList: action.payload.courseList,
      programList: action.payload.programList
    });
  case RECEIVE_COURSE_LIST_FAILURE:
    return Object.assign({}, state, {
      fetchStatus: FETCH_FAILURE
    });
  case CLEAR_COURSE_LIST:
    return INITIAL_COURSE_LIST_STATE;
  default:
    return state;
  }
};

const DEFAULT_PROFILE_IMAGE =
  (SETTINGS.edx_base_url + '/static/images/profiles/default_120.png').
  //replacing multiple "/" with a single forward slash, excluding the ones following the colon
  replace(/([^:]\/)\/+/g, "$1");
export const INITIAL_USER_PROFILE_STATE = {
  profile: {
    profile_url_large: DEFAULT_PROFILE_IMAGE// eslint-disable-line camelcase
  }
};
INITIAL_USER_PROFILE_STATE.profileCopy = INITIAL_USER_PROFILE_STATE.profile;

export const userProfile = (state = INITIAL_USER_PROFILE_STATE, action) => {
  switch (action.type) {
  case REQUEST_USER_PROFILE:
    return Object.assign({}, state, {
      userProfileStatus: FETCH_PROCESSING
    });
  case RECEIVE_USER_PROFILE_SUCCESS:
    return Object.assign({}, state, {
      userProfileStatus: FETCH_SUCCESS,
      profile: action.payload.profile,
      profileCopy: action.payload.profile
    });
  case RECEIVE_USER_PROFILE_FAILURE:
    return Object.assign({}, state, {
      userProfileStatus: FETCH_FAILURE
    });
  case CLEAR_PROFILE:
    return INITIAL_USER_PROFILE_STATE;
  case UPDATE_PROFILE:
    return Object.assign({}, state, {
      profileCopy: action.payload.profile
    });
  default:
    return state;
  }
};

const INITIAL_AUTHENTICATION_STATE = {
  isAuthenticated: SETTINGS.isAuthenticated,
  name: SETTINGS.name,
};

export const authentication = (state = INITIAL_AUTHENTICATION_STATE, action) => {
  return state;
};


const INITIAL_DASHBOARD_STATE = {
  courses: []
};

export const dashboard = (state = INITIAL_DASHBOARD_STATE, action) => {
  switch (action.type) {
  case REQUEST_DASHBOARD:
    return Object.assign({}, state, {
      fetchStatus: FETCH_PROCESSING
    });
  case RECEIVE_DASHBOARD_SUCCESS:
    return Object.assign({}, state, {
      fetchStatus: FETCH_SUCCESS,
      courses: action.payload.courses
    });
  case RECEIVE_DASHBOARD_FAILURE:
    return Object.assign({}, state, {
      fetchStatus: FETCH_FAILURE
    });
  case CLEAR_DASHBOARD:
    return INITIAL_DASHBOARD_STATE;
  default:
    return state;
  }
};


export default combineReducers({
  courseList,
  authentication,
  userProfile,
  dashboard,
});
