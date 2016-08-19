import configureTestStore from 'redux-asserts';

import {
  startEmailEdit,
  updateEmailEdit,
  clearEmailEdit,
  START_EMAIL_EDIT,
  UPDATE_EMAIL_EDIT,
  CLEAR_EMAIL_EDIT,
} from '../actions/email';
import rootReducer from '../reducers';
import { NEW_EMAIL_EDIT } from './email';
import { assert } from 'chai';
import sinon from 'sinon';

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

  let initialExpectation = { ...NEW_EMAIL_EDIT, query: query };

  it('should let you start editing an email', () => {
    return dispatchThen(startEmailEdit(query), [START_EMAIL_EDIT]).then(state => {
      assert.deepEqual(initialExpectation, state);
    });
  });

  it('should let you update an email edit in progress', () => {
    store.dispatch(startEmailEdit(query));
    let update = { body: "The body of my email" };
    return dispatchThen(updateEmailEdit(update), [UPDATE_EMAIL_EDIT]).then(state => {
      assert.deepEqual(state, { ...initialExpectation, ...update });
    });
  });

  it('should let you clear an existing email edit', () => {
    return assert.eventually.deepEqual(
      dispatchThen(clearEmailEdit(), [CLEAR_EMAIL_EDIT]),
      {}
    );
  });
});
