/* global SETTINGS: false */
import { combineReducers } from 'redux';
import {
  REQUEST_GET_USER_PROFILE,
  RECEIVE_GET_USER_PROFILE_SUCCESS,
  RECEIVE_GET_USER_PROFILE_FAILURE,
  CLEAR_PROFILE,
  UPDATE_PROFILE,
  START_PROFILE_EDIT,
  CLEAR_PROFILE_EDIT,
  REQUEST_PATCH_USER_PROFILE,
  RECEIVE_PATCH_USER_PROFILE_SUCCESS,
  RECEIVE_PATCH_USER_PROFILE_FAILURE,
  UPDATE_PROFILE_VALIDATION,

  SHOW_EDUCATION_FORM_DIALOG,
  HIDE_EDUCATION_FORM_DIALOG,
  TOGGLE_EDUCATION_LEVEL,

  REQUEST_DASHBOARD,
  RECEIVE_DASHBOARD_SUCCESS,
  RECEIVE_DASHBOARD_FAILURE,
  CLEAR_DASHBOARD,

  FETCH_FAILURE,
  FETCH_PROCESSING,
  FETCH_SUCCESS,
} from '../actions';
import { HIGH_SCHOOL, ASSOCIATE, BACHELORS, MASTERS, DOCTORATE } from '../constants';
import { ui } from './ui';

export const INITIAL_DIALOG_STATE = {
  openDialog: false,
  degreeLevel: '',
  educationIndex: null,
  educationId: null
};
export const educationDialog = (state = INITIAL_DIALOG_STATE, action) => {
  switch (action.type) {
  case SHOW_EDUCATION_FORM_DIALOG:
    return Object.assign({}, state, {
      openDialog: true,
      degreeLevel: action.payload.level,
      educationIndex: action.payload.index
    });
  case HIDE_EDUCATION_FORM_DIALOG:
    return INITIAL_DIALOG_STATE;
  default:
    return state;
  }
};

export const INITIAL_EDUCATION_LEVEL_STATE = {};
INITIAL_EDUCATION_LEVEL_STATE[HIGH_SCHOOL] = true;
INITIAL_EDUCATION_LEVEL_STATE[ASSOCIATE] = true;
INITIAL_EDUCATION_LEVEL_STATE[BACHELORS] = true;
INITIAL_EDUCATION_LEVEL_STATE[MASTERS] = false;
INITIAL_EDUCATION_LEVEL_STATE[DOCTORATE] = false;

export const educationLevels = (state = INITIAL_EDUCATION_LEVEL_STATE, action) => {
  switch (action.type) {
  case TOGGLE_EDUCATION_LEVEL:
    return action.payload.educationLevels;
  
  default:
    return state;
  }
};


export const INITIAL_USER_PROFILE_STATE = {
  profile: {}
};

export const userProfile = (state = INITIAL_USER_PROFILE_STATE, action) => {
  switch (action.type) {
  case REQUEST_GET_USER_PROFILE:
    return Object.assign({}, state, {
      getStatus: FETCH_PROCESSING
    });
  case RECEIVE_GET_USER_PROFILE_SUCCESS:
    return Object.assign({}, state, {
      getStatus: FETCH_SUCCESS,
      profile: action.payload.profile
    });
  case RECEIVE_GET_USER_PROFILE_FAILURE:
    return Object.assign({}, state, {
      getStatus: FETCH_FAILURE
    });
  case CLEAR_PROFILE:
    return INITIAL_USER_PROFILE_STATE;
  case UPDATE_PROFILE:
    if (state.edit === undefined) {
      // caller must have dispatched START_PROFILE_EDIT successfully first
      return state;
    }
    return Object.assign({}, state, {
      edit: Object.assign({}, state.edit, {
        profile: action.payload.profile
      })
    });
  case START_PROFILE_EDIT:
    if (state.getStatus !== FETCH_SUCCESS) {
      // ignore attempts to edit if we don't have a valid profile to edit yet
      return state;
    }
    return Object.assign({}, state, {
      edit: {
        profile: state.profile,
        errors: {}
      }
    });
  case CLEAR_PROFILE_EDIT:
    return Object.assign({}, state, {
      edit: undefined
    });
  case REQUEST_PATCH_USER_PROFILE:
    return Object.assign({}, state, {
      patchStatus: FETCH_PROCESSING
    });
  case RECEIVE_PATCH_USER_PROFILE_SUCCESS:
    return Object.assign({}, state, {
      patchStatus: FETCH_SUCCESS,
      profile: action.payload.profile
    });
  case RECEIVE_PATCH_USER_PROFILE_FAILURE:
    return Object.assign({}, state, {
      patchStatus: FETCH_FAILURE
    });
  case UPDATE_PROFILE_VALIDATION:
    if (state.edit === undefined) {
      // caller must have dispatched START_PROFILE_EDIT successfully first
      return state;
    }
    return Object.assign({}, state, {
      edit: Object.assign({}, state.edit, {
        errors: action.payload.errors
      })
    });
  default:
    return state;
  }
};

const INITIAL_DASHBOARD_STATE = {
  programs: []
};

export const dashboard = (state = INITIAL_DASHBOARD_STATE, action) => {
  switch (action.type) {
  case REQUEST_DASHBOARD:
    return Object.assign({}, state, {
      fetchStatus: FETCH_PROCESSING
    });
  case RECEIVE_DASHBOARD_SUCCESS:
    return Object.assign({}, state, {
      fetchStatus: FETCH_SUCCESS,
      programs: action.payload.programs
    });
  case RECEIVE_DASHBOARD_FAILURE:
    return Object.assign({}, state, {
      fetchStatus: FETCH_FAILURE
    });
  case CLEAR_DASHBOARD:
    return INITIAL_DASHBOARD_STATE;
  default:
    return state;
  }
};


export default combineReducers({
  userProfile,
  dashboard,
  ui,
  educationDialog,
  educationLevels
});
