// @flow
import configureTestStore from 'redux-asserts';

import { FETCH_SUCCESS, FETCH_FAILURE } from '../actions';
import {
  startEmailEdit,
  updateEmailEdit,
  clearEmailEdit,
  updateEmailValidation,
  sendSearchResultMail,
  START_EMAIL_EDIT,
  UPDATE_EMAIL_EDIT,
  CLEAR_EMAIL_EDIT,
  UPDATE_EMAIL_VALIDATION,
  INITIATE_SEND_EMAIL,
  SEND_EMAIL_SUCCESS,
  SEND_EMAIL_FAILURE,
} from '../actions/email';
import { INITIAL_ALL_EMAILS_STATE, INITIAL_EMAIL_STATE, NEW_EMAIL_EDIT } from './email';
import { SEARCH_EMAIL_TYPE } from '../components/email/constants';
import type { EmailSendResponse } from '../flow/emailTypes';
import * as api from '../lib/api';
import rootReducer from '../reducers';
import { assert } from 'chai';
import sinon from 'sinon';
import R from 'ramda';

describe('email reducers', () => {
  let sandbox,
    store,
    dispatchThen,
    emailType = SEARCH_EMAIL_TYPE;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    store = configureTestStore(rootReducer);
    dispatchThen = store.createDispatchThen(state => state.email);
  });

  afterEach(() => {
    sandbox.restore();
  });

  let initialExpectedEmailState = { ...INITIAL_EMAIL_STATE, inputs: NEW_EMAIL_EDIT };

  it('should let you start editing an email', () => {
    return dispatchThen(startEmailEdit(emailType), [START_EMAIL_EDIT]).then(state => {
      assert.deepEqual(state[emailType], initialExpectedEmailState);
    });
  });

  it('should let you update an email edit in progress', () => {
    store.dispatch(startEmailEdit(emailType));
    let updatedInputs = R.clone(initialExpectedEmailState.inputs);
    updatedInputs.body = 'The body of my email';
    return dispatchThen(
      updateEmailEdit({type: emailType, inputs: updatedInputs}),
      [UPDATE_EMAIL_EDIT]
    ).then(state => {
      assert.deepEqual(state[emailType], { ...initialExpectedEmailState, inputs: updatedInputs });
    });
  });

  it('should let you clear an existing email edit', () => {
    return assert.eventually.deepEqual(
      dispatchThen(clearEmailEdit(emailType), [CLEAR_EMAIL_EDIT]),
      INITIAL_ALL_EMAILS_STATE,
    );
  });

  it('should let you update email validation', () => {
    store.dispatch(startEmailEdit(emailType));
    let errors = { subject: "NO SUBJECT" };
    return dispatchThen(
      updateEmailValidation({type: emailType, errors: errors}),
      [UPDATE_EMAIL_VALIDATION]
    ).then(state => {
      assert.deepEqual(state[emailType].validationErrors, errors);
    });
  });

  describe('for send actions', () => {
    let sendSearchResultMailStub;
    let MAIL_SUCCESS_RESPONSE: EmailSendResponse = { errorStatusCode: 200 },
      searchRequest = { size: 50 };

    beforeEach(() => {
      sendSearchResultMailStub = sandbox.stub(api, 'sendSearchResultMail');
    });

    it('should go through expected state changes when sendSearchResultMail succeeds', () => {
      sendSearchResultMailStub.returns(Promise.resolve(MAIL_SUCCESS_RESPONSE));

      return dispatchThen(
        sendSearchResultMail('subject', 'body', searchRequest),
        [INITIATE_SEND_EMAIL, SEND_EMAIL_SUCCESS]
      ).then(emailState => {
        assert.equal(emailState[emailType].fetchStatus, FETCH_SUCCESS);
        assert.equal(sendSearchResultMailStub.callCount, 1);
        assert.deepEqual(sendSearchResultMailStub.args[0], ['subject', 'body', searchRequest]);
      });
    });

    it('should go through expected state changes when sendSearchResultMail fails', () => {
      sendSearchResultMailStub.returns(Promise.reject());

      return dispatchThen(
        sendSearchResultMail('subject', 'body', searchRequest),
        [INITIATE_SEND_EMAIL, SEND_EMAIL_FAILURE]
      ).then(emailState => {
        assert.equal(emailState[emailType].fetchStatus, FETCH_FAILURE);
      });
    });
  });
});
