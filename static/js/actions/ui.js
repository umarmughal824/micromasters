export const CLEAR_UI = 'CLEAR_UI';
export const UPDATE_DIALOG_TEXT = 'UPDATE_DIALOG_TEXT';
export const UPDATE_DIALOG_TITLE = 'UPDATE_DIALOG_TITLE';
export const SET_DIALOG_VISIBILITY = 'SET_DIALOG_VISIBILITY';
export const SET_WORK_HISTORY_EDIT = 'SET_WORK_HISTORY_EDIT';
export const SET_WORK_DIALOG_VISIBILITY = 'SET_WORK_DIALOG_VISIBILITY';
export const SET_WORK_DIALOG_INDEX = 'SET_WORK_DIALOG_INDEX';
export const TOGGLE_DASHBOARD_EXPANDER = 'TOGGLE_DASHBOARD_EXPANDER';

export const clearUI = () => ({ type: CLEAR_UI });
export const updateDialogText = text => (
  { type: UPDATE_DIALOG_TEXT, payload: text }
);

export const updateDialogTitle = title => (
  { type: UPDATE_DIALOG_TITLE, payload: title }
);

export const setDialogVisibility = bool => (
  { type: SET_DIALOG_VISIBILITY, payload: bool }
);

export const setWorkHistoryEdit = bool => (
  { type: SET_WORK_HISTORY_EDIT, payload: bool }
);

export const setWorkDialogVisibility = bool => (
  { type: SET_WORK_DIALOG_VISIBILITY, payload: bool }
);

export const setWorkDialogIndex = index => (
  { type: SET_WORK_DIALOG_INDEX, payload: index }
);

export const toggleDashboardExpander = (courseId, newValue) => ({
  type: TOGGLE_DASHBOARD_EXPANDER,
  payload: { courseId, newValue }
});
