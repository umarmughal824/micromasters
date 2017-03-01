// @flow
/* global SETTINGS: false */
import R from 'ramda';
import { INITIAL_DASHBOARD_STATE } from './dashboard';
import { guard } from '../lib/sanctuary';

export const getInfoByUsername = R.curry((
  reducer,
  defaultTo,
  username,
  state
) => (
  R.pathOr(defaultTo, [reducer, username], state)
));

export const getOwnDashboard = getInfoByUsername('dashboard', INITIAL_DASHBOARD_STATE, SETTINGS.user.username);

export const getDashboard = guard((username, dashboard) => (
  R.pathOr(INITIAL_DASHBOARD_STATE, [username], dashboard)
));
