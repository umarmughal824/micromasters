// @flow
import React from 'react';
import Dialog from 'material-ui/Dialog';
import Button from 'react-mdl/lib/Button';
import R from 'ramda';
import type { EmailEditState } from '../reducers/email';

const createDialogActions = (close, send) => ([
  <Button
    type="button"
    className="dialog-button cancel-button"
    key="first"
    onClick={close}
  >
    Cancel
  </Button>,
  <Button
    type="button"
    className="dialog-button save-button"
    key="second"
    onClick={send}
  >
    Send
  </Button>
]);

const hitsCount = searchkit => R.isNil(searchkit) ? 0 : searchkit.getHitsCount();

type EmailDialogProps = {
  closeEmailDialog: () => void,
  updateEmailEdit:  Function,
  open:             boolean,
  email:            EmailEditState,
  searchkit:        Object,
  sendEmail:        (e: EmailEditState) => void,
};

const EmailCompositionDialog = (props: EmailDialogProps) => {
  const {
    closeEmailDialog,
    updateEmailEdit,
    open,
    email,
    searchkit,
    sendEmail,
  } = props;

  return <Dialog
    open={open}
    className="email-composition-dialog"
    actions={createDialogActions(closeEmailDialog, sendEmail)}
    onRequestClose={closeEmailDialog}
    title="New Email"
  >
    <div className="email-composition-contents">
      <span className="user-count">
        {hitsCount(searchkit)} recipients selected
      </span>
      <textarea
        rows="1"
        className="email-subject"
        placeholder="Subject"
        value={email.subject || ""}
        onChange={updateEmailEdit('subject')}
      />
      <textarea
        rows="7"
        className="email-body"
        placeholder="Type a message"
        value={email.body || ""}
        onChange={updateEmailEdit('body')}
      />
    </div>
  </Dialog>;
};

export default EmailCompositionDialog;
