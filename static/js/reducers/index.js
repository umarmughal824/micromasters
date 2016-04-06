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

  FETCH_FAILURE,
  FETCH_PROCESSING,
  FETCH_SUCCESS,
} from '../actions/index';

const INITIAL_COURSE_LIST_STATE = {
  courseList: []
};

export const courseList = (state = INITIAL_COURSE_LIST_STATE, action) => {
  switch (action.type) {
  case REQUEST_COURSE_LIST:
    return Object.assign({}, state, {
      courseListStatus: FETCH_PROCESSING
    });

  case RECEIVE_COURSE_LIST_SUCCESS:
    return Object.assign({}, state, {
      courseListStatus: FETCH_SUCCESS,
      courseList: action.payload.courseList
    });

  case RECEIVE_COURSE_LIST_FAILURE:
    return Object.assign({}, state, {
      courseListStatus: FETCH_FAILURE
    });

  case CLEAR_COURSE_LIST:
    return Object.assign({}, state, {
      courseListStatus: undefined,
      courseList: []
    });

  default:
    return state;
  }
};

export const INITIAL_USER_PROFILE_STATE = {
  profile: {
    profile_url_large: // eslint-disable-line camelcase
      (SETTINGS.edx_base_url + '/static/images/profiles/default_120.png').
        //replacing multiple "/" with a single forward slash, excluding the ones following the colon
        replace(/([^:]\/)\/+/g, "$1")
  }
};


export const userProfile = (state = INITIAL_USER_PROFILE_STATE, action) => {
  switch (action.type) {
  case REQUEST_USER_PROFILE:
    return Object.assign({}, state, {
      userProfileStatus: FETCH_PROCESSING
    });
  case RECEIVE_USER_PROFILE_SUCCESS:
    return Object.assign({}, state, {
      userProfileStatus: FETCH_SUCCESS,
      profile: action.payload.profile
    });
  case RECEIVE_USER_PROFILE_FAILURE:
    return Object.assign({}, state, {
      userProfileStatus: FETCH_FAILURE
    });
  case CLEAR_PROFILE:
    return INITIAL_USER_PROFILE_STATE;

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

export default combineReducers({
  courseList,
  authentication,
  userProfile
});
