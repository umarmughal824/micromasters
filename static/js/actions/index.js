import _ from 'lodash';

import * as api from '../util/api';
import * as util from '../util/util';

// user profile actions
export const REQUEST_GET_USER_PROFILE = 'REQUEST_GET_USER_PROFILE';
export const RECEIVE_GET_USER_PROFILE_SUCCESS = 'RECEIVE_GET_USER_PROFILE_SUCCESS';
export const RECEIVE_GET_USER_PROFILE_FAILURE = 'RECEIVE_GET_USER_PROFILE_FAILURE';
export const CLEAR_PROFILE = 'CLEAR_PROFILE';
export const UPDATE_PROFILE = 'UPDATE_PROFILE';
export const START_PROFILE_EDIT = 'START_PROFILE_EDIT';
export const CLEAR_PROFILE_EDIT = 'CLEAR_PROFILE_EDIT';
export const REQUEST_PATCH_USER_PROFILE = 'REQUEST_PATCH_USER_PROFILE';
export const RECEIVE_PATCH_USER_PROFILE_SUCCESS = 'RECEIVE_PATCH_USER_PROFILE_SUCCESS';
export const RECEIVE_PATCH_USER_PROFILE_FAILURE = 'RECEIVE_PATCH_USER_PROFILE_FAILURE';
export const UPDATE_PROFILE_VALIDATION = 'UPDATE_PROFILE_VALIDATION';

// constants for fetch status (these are not action types)
export const FETCH_FAILURE = 'FETCH_FAILURE';
export const FETCH_SUCCESS = 'FETCH_SUCCESS';
export const FETCH_PROCESSING = 'FETCH_PROCESSING';

// actions for user profile
const requestGetUserProfile = username => ({
  type: REQUEST_GET_USER_PROFILE,
  payload: { username }
});

export const receiveGetUserProfileSuccess = (username, profile) => ({
  type: RECEIVE_GET_USER_PROFILE_SUCCESS,
  payload: { profile, username }
});

const receiveGetUserProfileFailure = username => ({
  type: RECEIVE_GET_USER_PROFILE_FAILURE,
  payload: { username }
});

export const clearProfile = username => ({
  type: CLEAR_PROFILE,
  payload: { username }
});

export const updateProfile = (username, profile) => ({
  type: UPDATE_PROFILE,
  payload: { profile, username }
});

export const startProfileEdit = username => ({
  type: START_PROFILE_EDIT,
  payload: { username }
});
export const clearProfileEdit = username => ({
  type: CLEAR_PROFILE_EDIT,
  payload: { username }
});

const requestPatchUserProfile = username => ({
  type: REQUEST_PATCH_USER_PROFILE,
  payload: { username }
});

const receivePatchUserProfileSuccess = (username, profile) => ({
  type: RECEIVE_PATCH_USER_PROFILE_SUCCESS,
  payload: { profile, username }
});

const receivePatchUserProfileFailure = username => ({
  type: RECEIVE_PATCH_USER_PROFILE_FAILURE,
  payload: { username }
});

export const saveProfile = (username, profile) => {
  return dispatch => {
    dispatch(requestPatchUserProfile(username));
    return api.patchUserProfile(username, profile).
      then(newProfile => dispatch(receivePatchUserProfileSuccess(username, newProfile))).
      catch(e => {
        dispatch(receivePatchUserProfileFailure(username));
        // propagate exception
        return Promise.reject(e);
      });
  };
};
export const updateProfileValidation = (username, errors) => ({
  type: UPDATE_PROFILE_VALIDATION,
  payload: { errors, username }
});

export const validateProfile = (username, profile, requiredFields, messages) => {
  return dispatch => {
    let errors = util.validateProfile(profile, requiredFields, messages);
    dispatch(updateProfileValidation(username, errors));
    if (_.isEmpty(errors)) {
      return Promise.resolve();
    } else {
      return Promise.reject();
    }
  };
};

export function fetchUserProfile(username) {
  return dispatch => {
    dispatch(requestGetUserProfile(username));
    return api.getUserProfile(username).
      then(json => dispatch(receiveGetUserProfileSuccess(username, json))).
      catch(e => {
        dispatch(receiveGetUserProfileFailure(username));
        // propagate exception
        return Promise.reject(e);
      });
  };
}

// dashboard list actions
export const REQUEST_DASHBOARD = 'REQUEST_DASHBOARD';
export const RECEIVE_DASHBOARD_SUCCESS = 'RECEIVE_DASHBOARD_SUCCESS';
export const RECEIVE_DASHBOARD_FAILURE = 'RECEIVE_DASHBOARD_FAILURE';
export const CLEAR_DASHBOARD = 'CLEAR_DASHBOARD';

const requestDashboard = () => ({ type: REQUEST_DASHBOARD });
export const receiveDashboardSuccess = programs => ({
  type: RECEIVE_DASHBOARD_SUCCESS,
  payload: { programs }
});
const receiveDashboardFailure = () => ({ type: RECEIVE_DASHBOARD_FAILURE });
export const clearDashboard = () => ({ type: CLEAR_DASHBOARD });

export function fetchDashboard() {
  return dispatch => {
    dispatch(requestDashboard());
    return api.getDashboard().
      then(dashboard => dispatch(receiveDashboardSuccess(dashboard))).
      catch(e => {
        dispatch(receiveDashboardFailure());
        // propagate exception
        return Promise.reject(e);
      });
  };
}
