// @flow
import _ from 'lodash';

import {
  REQUEST_DASHBOARD,
  RECEIVE_DASHBOARD_SUCCESS,
  RECEIVE_DASHBOARD_FAILURE,
  CLEAR_DASHBOARD,
  UPDATE_COURSE_STATUS,
} from '../actions/dashboard';
import {
  FETCH_FAILURE,
  FETCH_PROCESSING,
  FETCH_SUCCESS,
} from '../actions';
import type { DashboardState } from '../flow/dashboardTypes';
import type { Action } from '../flow/reduxTypes';

const INITIAL_DASHBOARD_STATE: DashboardState = {
  programs: []
};

export const dashboard = (state: DashboardState = INITIAL_DASHBOARD_STATE, action: Action) => {
  switch (action.type) {
  case REQUEST_DASHBOARD:
    if (action.payload.noSpinner) {
      return state;
    } else {
      return {
        ...state,
        fetchStatus: FETCH_PROCESSING
      };
    }
  case RECEIVE_DASHBOARD_SUCCESS:
    return {
      ...state,
      fetchStatus: FETCH_SUCCESS,
      programs: action.payload.programs
    };
  case RECEIVE_DASHBOARD_FAILURE:
    return {
      ...state,
      fetchStatus: FETCH_FAILURE,
      errorInfo: action.payload.errorInfo,
    };
  case UPDATE_COURSE_STATUS: {
    const { courseId, status } = action.payload;
    let programs = _.cloneDeep(state.programs);
    for (let program of programs) {
      for (let course of program.courses) {
        for (let courseRun of course.runs) {
          if (courseRun.course_id === courseId) {
            courseRun.status = status;
          }
        }
      }
    }
    return {
      ...state,
      programs,
    };
  }
  case CLEAR_DASHBOARD:
    return INITIAL_DASHBOARD_STATE;
  default:
    return state;
  }
};


