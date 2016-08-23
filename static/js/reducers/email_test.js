import configureTestStore from 'redux-asserts';

import {
  startEmailEdit,
  updateEmailEdit,
  clearEmailEdit,
  updateEmailValidation,
  START_EMAIL_EDIT,
  UPDATE_EMAIL_EDIT,
  CLEAR_EMAIL_EDIT,
  UPDATE_EMAIL_VALIDATION,
} from '../actions/email';
import rootReducer from '../reducers';
import { NEW_EMAIL_EDIT, INITIAL_EMAIL_STATE } from './email';
import { assert } from 'chai';
import sinon from 'sinon';
import R from 'ramda';

describe('email reducers', () => {
  let sandbox, store, dispatchThen;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    store = configureTestStore(rootReducer);
    dispatchThen = store.createDispatchThen(state => state.email);
  });

  afterEach(() => {
    sandbox.restore();
    store = null;
    dispatchThen = null;
  });

  let query = { query: "Hi, I'm a query!" };

  let initialExpectation = {
    email: { ...NEW_EMAIL_EDIT, query: query },
    errors: {}
  };

  it('should let you start editing an email', () => {
    return dispatchThen(startEmailEdit(query), [START_EMAIL_EDIT]).then(state => {
      assert.deepEqual(initialExpectation, state);
    });
  });

  it('should let you update an email edit in progress', () => {
    store.dispatch(startEmailEdit(query));
    let update = R.clone(initialExpectation.email);
    update.body = 'The body of my email';
    return dispatchThen(updateEmailEdit(update), [UPDATE_EMAIL_EDIT]).then(state => {
      assert.deepEqual(state, { ...initialExpectation, email: update });
    });
  });

  it('should let you clear an existing email edit', () => {
    return assert.eventually.deepEqual(
      dispatchThen(clearEmailEdit(), [CLEAR_EMAIL_EDIT]),
      INITIAL_EMAIL_STATE,
    );
  });

  it('should let you update email validation', () => {
    store.dispatch(startEmailEdit(query));
    let errors = { subject: "NO SUBJECT" };
    return dispatchThen(updateEmailValidation(errors), [UPDATE_EMAIL_VALIDATION]).then(state => {
      assert.deepEqual(state.errors, errors);
    });
  });
});
