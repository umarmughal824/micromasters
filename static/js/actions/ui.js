// general UI actions
export const CLEAR_UI = 'CLEAR_UI';
export const clearUI = () => ({ type: CLEAR_UI });

export const UPDATE_DIALOG_TEXT = 'UPDATE_DIALOG_TEXT';
export const updateDialogText = text => (
  { type: UPDATE_DIALOG_TEXT, payload: text }
);

export const UPDATE_DIALOG_TITLE = 'UPDATE_DIALOG_TITLE';
export const updateDialogTitle = title => (
  { type: UPDATE_DIALOG_TITLE, payload: title }
);

export const SET_DIALOG_VISIBILITY = 'SET_DIALOG_VISIBILITY';
export const setDialogVisibility = bool => (
  { type: SET_DIALOG_VISIBILITY, payload: bool }
);

// work history actions
export const SET_WORK_HISTORY_EDIT = 'SET_WORK_HISTORY_EDIT';
export const setWorkHistoryEdit = bool => (
  { type: SET_WORK_HISTORY_EDIT, payload: bool }
);

export const SET_WORK_DIALOG_VISIBILITY = 'SET_WORK_DIALOG_VISIBILITY';
export const setWorkDialogVisibility = bool => (
  { type: SET_WORK_DIALOG_VISIBILITY, payload: bool }
);

export const SET_WORK_DIALOG_INDEX = 'SET_WORK_DIALOG_INDEX';
export const setWorkDialogIndex = index => (
  { type: SET_WORK_DIALOG_INDEX, payload: index }
);

// dashboard actions
export const TOGGLE_DASHBOARD_EXPANDER = 'TOGGLE_DASHBOARD_EXPANDER';
export const toggleDashboardExpander = (courseId, newValue) => ({
  type: TOGGLE_DASHBOARD_EXPANDER,
  payload: { courseId, newValue }
});

// education actions
export const SET_EDUCATION_DIALOG_VISIBILITY = 'SET_EDUCATION_DIALOG_VISIBILITY';
export const setEducationDialogVisibility = bool => (
  { type: SET_EDUCATION_DIALOG_VISIBILITY, payload: bool }
);

export const SET_EDUCATION_DIALOG_INDEX = 'SET_EDUCATION_DIALOG_INDEX';
export const setEducationDialogIndex = index => (
  { type: SET_EDUCATION_DIALOG_INDEX, payload: index }
);

export const SET_EDUCATION_DEGREE_LEVEL = 'SET_EDUCATION_DEGREE_LEVEL';
export const setEducationDegreeLevel = level => (
  { type: SET_EDUCATION_DEGREE_LEVEL, payload: level }
);

export const SET_EDUCATION_DEGREE_INCLUSIONS = 'SET_EDUCATION_DEGREE_INCLUSIONS';
export const setEducationDegreeInclusions = degreeInclusions => (
  { type: SET_EDUCATION_DEGREE_INCLUSIONS, payload: degreeInclusions }
);

export const SET_USER_PAGE_DIALOG_VISIBILITY = 'SET_USER_PAGE_DIALOG_VISIBILITY';
export const setUserPageDialogVisibility = bool => (
  { type: SET_USER_PAGE_DIALOG_VISIBILITY, payload: bool }
);
