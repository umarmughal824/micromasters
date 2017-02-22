// @flow
import { assert } from 'chai';

import {
  requestDashboard,
  receiveDashboardSuccess,
  receiveDashboardFailure,
  clearDashboard,
  updateCourseStatus,

  REQUEST_DASHBOARD,
  RECEIVE_DASHBOARD_SUCCESS,
  RECEIVE_DASHBOARD_FAILURE,
  CLEAR_DASHBOARD,
  UPDATE_COURSE_STATUS,
} from './dashboard';
import {
  DASHBOARD_RESPONSE,
  ERROR_RESPONSE,
} from '../constants';

describe('dashboard actions', () => {
  it('requestDashboard should pass noSpinner in the payload', () => {
    assert.deepEqual(requestDashboard(true), {
      type: REQUEST_DASHBOARD,
      payload: {
        noSpinner: true
      }
    });
  });

  it('receiveDashboardSuccess should pass a list of programs', () => {
    assert.deepEqual(receiveDashboardSuccess(DASHBOARD_RESPONSE), {
      type: RECEIVE_DASHBOARD_SUCCESS,
      payload: {
        programs: DASHBOARD_RESPONSE
      }
    });
  });

  it('receiveDashboardFailure should pass an error response', () => {
    assert.deepEqual(receiveDashboardFailure(ERROR_RESPONSE), {
      type: RECEIVE_DASHBOARD_FAILURE,
      payload: {
        errorInfo: ERROR_RESPONSE
      }
    });
  });

  it('clearDashboard should only have its type', () => {
    assert.deepEqual(clearDashboard(), { type: CLEAR_DASHBOARD });
  });

  it('updateCourseStatus has courseId and status in its payload', () => {
    assert.deepEqual(updateCourseStatus('course_id', 'status'), {
      type: UPDATE_COURSE_STATUS,
      payload: {
        courseId: 'course_id',
        status: 'status'
      }
    });
  });
});
