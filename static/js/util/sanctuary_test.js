// @flow
import S, { Maybe, Just, Nothing } from 'sanctuary';
import { assert } from 'chai';

import { allJust, mstr } from './sanctuary';

describe('sanctuary util functions', () => {
  let maybeEquality = (j1, j2) => assert(j1.equals(j2), "just equality");

  let isNothing = m => assert(m.isNothing, "should be nothing");

  describe('allJust', () => {
    let maybes = [
      Maybe.of(2),
      Maybe.of('maybe?')
    ];

    it('should return Just(values) if passed an array of Just values', () => {
      let checked = allJust(maybes);
      assert(S.isJust(checked));
      checked.value.forEach((m, i) => maybeEquality(m, maybes[i]));
    });

    it('should return Nothing if passed an array with a Nothing in it', () => {
      isNothing(allJust(maybes.concat(Nothing())));
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
