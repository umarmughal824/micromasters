export type Email = {
  subject?:   ?string,
  body?:      ?string,
  query?:     ?Object,
};

export type EmailSendResponse = {
  errorStatusCode?:  number,
};

export type EmailSendError = EmailSendResponse;

export type EmailValidationErrors = {
  subject?:   ?string,
  body?:      ?string,
  query?:     ?string,
};

export type EmailState = {
  email:  Email,
  validationErrors: EmailValidationErrors,
  sendError: EmailSendError,
  fetchStatus?: ?string,
}
