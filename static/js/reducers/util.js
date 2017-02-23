// @flow
/* global SETTINGS: false */
import R from 'ramda';
import { INITIAL_DASHBOARD_STATE } from './dashboard';

export const getInfoByUsername = R.curry((
  reducer,
  username,
  defaultTo,
  state
) => (
  R.pathOr(defaultTo, [reducer, username], state)
));

export const getOwnDashboard = getInfoByUsername('dashboard', SETTINGS.user.username, INITIAL_DASHBOARD_STATE);
