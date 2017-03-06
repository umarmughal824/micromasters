// @flow
/* global SETTINGS: false */
import R from 'ramda';
import { INITIAL_DASHBOARD_STATE } from './dashboard';
import { guard } from '../lib/sanctuary';
import type { DashboardsState } from '../flow/dashboardTypes';

export const getInfoByUsername = R.curry((
  reducer,
  defaultTo,
  username,
  state
) => (
  R.pathOr(defaultTo, [reducer, username], state)
));

export const getOwnDashboard = (state: {dashboard?: DashboardsState}) => (
  getInfoByUsername(
    'dashboard',
    INITIAL_DASHBOARD_STATE,
    SETTINGS.user ? SETTINGS.user.username : "",
    state
  )
);

export const getDashboard = guard((username, dashboard) => (
  R.pathOr(INITIAL_DASHBOARD_STATE, [username], dashboard)
));
