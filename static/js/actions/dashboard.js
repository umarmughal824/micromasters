// @flow
import { createAction } from 'redux-actions';
import type { Dispatch } from 'redux';

import * as api from '../lib/api';
import type { Dispatcher } from '../flow/reduxTypes';
import type { Dashboard } from '../flow/dashboardTypes';
import type { APIErrorInfo } from '../flow/generalTypes';

export const UPDATE_COURSE_STATUS = 'UPDATE_COURSE_STATUS';
export const updateCourseStatus = createAction(UPDATE_COURSE_STATUS, (courseId, status) => ({
  courseId, status
}));

// dashboard list actions
export const REQUEST_DASHBOARD = 'REQUEST_DASHBOARD';
export const requestDashboard = createAction(REQUEST_DASHBOARD, (noSpinner: boolean) => ({ noSpinner }));

export const RECEIVE_DASHBOARD_SUCCESS = 'RECEIVE_DASHBOARD_SUCCESS';
export const receiveDashboardSuccess = createAction(RECEIVE_DASHBOARD_SUCCESS, (programs: Object[]) => ({ programs }));

export const RECEIVE_DASHBOARD_FAILURE = 'RECEIVE_DASHBOARD_FAILURE';
export const receiveDashboardFailure = createAction(
  RECEIVE_DASHBOARD_FAILURE,
  (errorInfo: APIErrorInfo) => ({ errorInfo })
);

export const CLEAR_DASHBOARD = 'CLEAR_DASHBOARD';
export const clearDashboard = createAction(CLEAR_DASHBOARD);

export function fetchDashboard(username: string, noSpinner: boolean = false): Dispatcher<Dashboard> {
  return (dispatch: Dispatch) => {
    dispatch(requestDashboard(noSpinner));
    return api.getDashboard(username).
      then(dashboard => dispatch(receiveDashboardSuccess(dashboard))).
      catch(error => {
        dispatch(receiveDashboardFailure(error));
        // the exception is assumed handled and will not be propagated
      });
  };
}
