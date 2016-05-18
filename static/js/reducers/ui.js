import {
  CLEAR_UI,
  UPDATE_DIALOG_TEXT,
  UPDATE_DIALOG_TITLE,
  SET_DIALOG_VISIBILITY,
  SET_WORK_HISTORY_EDIT,
  SET_WORK_DIALOG_VISIBILITY,
  SET_WORK_DIALOG_INDEX,
  TOGGLE_DASHBOARD_EXPANDER,
} from '../actions/ui';

export const INITIAL_UI_STATE = {
  workHistoryEdit: true,
  workDialogVisibility: false,
  dashboardExpander: {}
};

export const ui = (state = INITIAL_UI_STATE, action) => {
  switch (action.type) {
  case UPDATE_DIALOG_TEXT:
    return Object.assign({}, state, {
      dialog: Object.assign(
        {},
        state.dialog,
        { text: action.payload }
      )
    });
  case UPDATE_DIALOG_TITLE:
    return Object.assign({}, state, {
      dialog: Object.assign(
        {},
        state.dialog,
        { title: action.payload }
      )
    });
  case SET_DIALOG_VISIBILITY:
    return Object.assign({}, state, {
      dialog: Object.assign(
        {},
        state.dialog,
        { visible: action.payload }
      )
    });
  case SET_WORK_HISTORY_EDIT:
    return Object.assign({}, state, {
      workHistoryEdit: action.payload
    });
  case SET_WORK_DIALOG_VISIBILITY:
    return Object.assign({}, state, {
      workDialogVisibility: action.payload
    });
  case SET_WORK_DIALOG_INDEX:
    return Object.assign({}, state, {
      workDialogIndex: action.payload
    });
  case CLEAR_UI:
    return INITIAL_UI_STATE;
  case TOGGLE_DASHBOARD_EXPANDER: {
    let clone = Object.assign({}, state.dashboardExpander);
    clone[action.payload.courseId] = action.payload.newValue;
    return Object.assign({}, state, {
      dashboardExpander: clone
    });
  }
  default:
    return state;
  }
};
