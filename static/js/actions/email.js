// @flow
export const actionCreatorGenerator = (type: string) => (
  (args: any) => args === undefined ? { type: type } : { type: type, payload: args }
);

export const START_EMAIL_EDIT = 'START_EMAIL_EDIT';
export const startEmailEdit = actionCreatorGenerator(START_EMAIL_EDIT);

export const UPDATE_EMAIL_EDIT = 'UPDATE_EMAIL_EDIT';
export const updateEmailEdit = actionCreatorGenerator(UPDATE_EMAIL_EDIT);

export const CLEAR_EMAIL_EDIT = 'CLEAR_EMAIL_EDIT';
export const clearEmailEdit = actionCreatorGenerator(CLEAR_EMAIL_EDIT);

export const UPDATE_EMAIL_VALIDATION = 'UPDATE_EMAIL_VALIDATION';
export const updateEmailValidation = actionCreatorGenerator(UPDATE_EMAIL_VALIDATION);
