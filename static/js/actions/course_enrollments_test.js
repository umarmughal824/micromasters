// @flow
import { assert } from 'chai';
import configureTestStore from 'redux-asserts';

import { showEnrollPayLaterSuccessMessage } from './course_enrollments';
import {
  showEnrollPayLaterSuccess,
  SHOW_ENROLL_PAY_LATER_SUCCESS,
} from './ui';
import rootReducer from '../reducers';

describe('show and hide enroll pay later success alert', () => {
  let store, dispatchThen;

  beforeEach(() => {
    store = configureTestStore(rootReducer);
    dispatchThen = store.createDispatchThen(state => state.ui);
  });

  it('should set and reset enroll pay later dialog', () => {
    return dispatchThen(
      showEnrollPayLaterSuccessMessage('foo/bar/baz'),
      [SHOW_ENROLL_PAY_LATER_SUCCESS]
    ).then((state) => {
      assert.equal(state.showEnrollPayLaterSuccess, 'foo/bar/baz');
      return dispatchThen(
        showEnrollPayLaterSuccess(null),
        [SHOW_ENROLL_PAY_LATER_SUCCESS]
      ).then((state) => {
        assert.deepEqual(state.showEnrollPayLaterSuccess, null);
      });
    });
  });
});
