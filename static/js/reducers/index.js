/* global SETTINGS: false */
import { combineReducers } from 'redux';
import {
  REQUEST_COURSE_LIST,
  RECEIVE_COURSE_LIST_SUCCESS,
  RECEIVE_COURSE_LIST_FAILURE,
  CLEAR_COURSE_LIST,

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
});
