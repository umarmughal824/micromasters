// @flow
import { assert } from 'chai';

import {
  actionCreatorGenerator,
  startEmailEdit,
  updateEmailEdit,
  clearEmailEdit,

  START_EMAIL_EDIT,
  UPDATE_EMAIL_EDIT,
  CLEAR_EMAIL_EDIT,
} from './email';

describe('email actions', () => {
  describe('actionCreatorGenerator', () => {
    it('should return a function', () => {
      assert.isFunction(actionCreatorGenerator(START_EMAIL_EDIT));
    });

    it('returned function should return a simple action when no args are passed', () => {
      let creator = actionCreatorGenerator(START_EMAIL_EDIT);
      assert.deepEqual({ type: START_EMAIL_EDIT }, creator());
    });

    it('returned function should return an action w/ payload when args are passed', () => {
      let creator = actionCreatorGenerator(START_EMAIL_EDIT);
      let expected = { type: START_EMAIL_EDIT, payload: "HI" };
      assert.deepEqual(expected, creator('HI'));
    });
  });

  describe('email action helpers', () => {
    const assertCreatedActionHelper = ([actionHelper, actionType]) => {
      it(`should create the ${actionType} simple action helper correctly`, () => {
        assert.deepEqual(actionHelper(), {type: actionType});
      });

      it(`should create the ${actionType} action helper with args correctly`, () => {
        assert.deepEqual(actionHelper({foo: "bar"}), { type: actionType, payload: { foo: "bar" } });
      });
    };

    [
      [startEmailEdit, START_EMAIL_EDIT],
      [updateEmailEdit, UPDATE_EMAIL_EDIT],
      [clearEmailEdit, CLEAR_EMAIL_EDIT],
    ].forEach(assertCreatedActionHelper);
  });
});
