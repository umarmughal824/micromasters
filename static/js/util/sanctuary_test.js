// @flow
import { assert } from 'chai';

import { S, allJust, mstr } from './sanctuary';
const { Maybe, Just, Nothing } = S;

export const assertMaybeEquality = (m1: Maybe, m2: Maybe) => {
  assert(m1.equals(m2), "Maybe's should be equal");
};

export const assertIsNothing = (m: Maybe) => assert(m.isNothing, "should be nothing");

describe('sanctuary util functions', () => {

  describe('allJust', () => {
    let maybes = [
      Maybe.of(2),
      Maybe.of('maybe?')
    ];

    it('should return Just(values) if passed an array of Just values', () => {
      let checked = allJust(maybes);
      assert(S.isJust(checked));
      checked.value.forEach((m, i) => assertMaybeEquality(m, maybes[i]));
    });

    it('should return Nothing if passed an array with a Nothing in it', () => {
      assertIsNothing(allJust(maybes.concat(Nothing())));
    });
  });

  describe('mstr', () => {
    it('should print an empty string if called on Nothing', () => {
      assert.equal("", mstr(Nothing()));
    });

    it('should print the value wrapped with Just', () => {
      assert.equal("4", mstr(Just(4)));
      assert.equal("some text", mstr(Just("some text")));
    });
  });
});
