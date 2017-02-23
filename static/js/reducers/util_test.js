// @flow
/* global SETTINGS: false */
import { assert } from 'chai';

import { getOwnDashboard } from './util';
import { DASHBOARD_RESPONSE } from '../test_constants';
import { INITIAL_DASHBOARD_STATE } from './dashboard';

describe('reducer utilities', () => {
  describe('username selectors', () => {
    describe('getOwnDashboard', () => {
      it('should return dashboard -> username, if present', () => {
        let dashboard = {
          dashboard: {
            [SETTINGS.user.username]: DASHBOARD_RESPONSE
          }
        };
        assert.deepEqual(getOwnDashboard(dashboard), DASHBOARD_RESPONSE);
      });

      it('should return INITIAL_DASHBOARD_STATE otherwise', () => {
        assert.deepEqual(getOwnDashboard({}), INITIAL_DASHBOARD_STATE);
      });
    });
  });
});
