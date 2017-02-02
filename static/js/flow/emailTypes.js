// @flow
export type EmailSendResponse = {
  errorStatusCode?: number,
};
export type EmailSendError = EmailSendResponse;

export type EmailInputs = {
  subject?:   ?string,
  body?:      ?string,
};
export type EmailValidationErrors = EmailInputs;

export type EmailState = {
  inputs:           EmailInputs,
  subheading?:      ?string,
  params:           Object,
  validationErrors: EmailValidationErrors,
  sendError:        EmailSendError,
  fetchStatus?:     ?string,
};

export type AllEmailsState = {
  searchResultEmail:  EmailState,
  courseTeamEmail:    EmailState,
};
