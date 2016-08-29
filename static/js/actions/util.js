// @flow
import { assert } from 'chai';

type ActionHelperManifest = [Function, string];
export const assertCreatedActionHelper = ([actionHelper, actionType]: ActionHelperManifest) => {
  assert.deepEqual(actionHelper(), {type: actionType});
  assert.deepEqual(actionHelper({foo: "bar"}), { type: actionType, payload: { foo: "bar" } });
};
