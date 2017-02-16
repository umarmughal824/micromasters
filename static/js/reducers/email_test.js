// @flow
import configureTestStore from 'redux-asserts';

import { FETCH_SUCCESS, FETCH_FAILURE } from '../actions';
import {
  startEmailEdit,
  updateEmailEdit,
  clearEmailEdit,
  updateEmailValidation,
  sendSearchResultMail,
  sendCourseTeamMail,
  START_EMAIL_EDIT,
  UPDATE_EMAIL_EDIT,
  CLEAR_EMAIL_EDIT,
  UPDATE_EMAIL_VALIDATION,
  INITIATE_SEND_EMAIL,
  SEND_EMAIL_SUCCESS,
  SEND_EMAIL_FAILURE,
} from '../actions/email';
import { INITIAL_ALL_EMAILS_STATE, INITIAL_EMAIL_STATE } from './email';
import { SEARCH_EMAIL_TYPE, COURSE_EMAIL_TYPE } from '../components/email/constants';
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

  let initialExpectedEmailState = INITIAL_EMAIL_STATE;

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
      {
        ...INITIAL_ALL_EMAILS_STATE,
        [emailType]: INITIAL_EMAIL_STATE
      },
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

  describe('for the sendSearchResultMail action', () => {
    let sendSearchResultMailStub;
    let MAIL_SUCCESS_RESPONSE: EmailSendResponse = { errorStatusCode: 200 },
      searchRequest = { size: 50 };

    beforeEach(() => {
      emailType = SEARCH_EMAIL_TYPE;
      sendSearchResultMailStub = sandbox.stub(api, 'sendSearchResultMail');
      store.dispatch(startEmailEdit(emailType));
    });

    it('should go through expected state changes when the send function succeeds', () => {
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

    it('should go through expected state changes when the send function fails', () => {
      sendSearchResultMailStub.returns(Promise.reject());

      return dispatchThen(
        sendSearchResultMail('subject', 'body', searchRequest),
        [INITIATE_SEND_EMAIL, SEND_EMAIL_FAILURE]
      ).then(emailState => {
        assert.equal(emailState[emailType].fetchStatus, FETCH_FAILURE);
      });
    });
  });

  describe('for the sendCourseTeamMail action', () => {
    let sendCourseTeamMailStub;
    let MAIL_SUCCESS_RESPONSE: EmailSendResponse = { errorStatusCode: 200 },
      courseId = 123;

    beforeEach(() => {
      emailType = COURSE_EMAIL_TYPE;
      sendCourseTeamMailStub = sandbox.stub(api, 'sendCourseTeamMail');
      store.dispatch(startEmailEdit(emailType));
    });

    it('should go through expected state changes when the send function succeeds', () => {
      sendCourseTeamMailStub.returns(Promise.resolve(MAIL_SUCCESS_RESPONSE));

      return dispatchThen(
        sendCourseTeamMail('subject', 'body', courseId),
        [INITIATE_SEND_EMAIL, SEND_EMAIL_SUCCESS]
      ).then(emailState => {
        assert.equal(emailState[emailType].fetchStatus, FETCH_SUCCESS);
        assert.equal(sendCourseTeamMailStub.callCount, 1);
        assert.deepEqual(sendCourseTeamMailStub.args[0], ['subject', 'body', courseId]);
      });
    });

    it('should go through expected state changes when the send function fails', () => {
      sendCourseTeamMailStub.returns(Promise.reject());

      return dispatchThen(
        sendCourseTeamMail('subject', 'body', courseId),
        [INITIATE_SEND_EMAIL, SEND_EMAIL_FAILURE]
      ).then(emailState => {
        assert.equal(emailState[emailType].fetchStatus, FETCH_FAILURE);
      });
    });
  });
});
