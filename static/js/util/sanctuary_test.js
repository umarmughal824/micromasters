// @flow
import { assert } from 'chai';

import { S, allJust, mstr, ifNil } from './sanctuary';
const { Maybe, Just, Nothing } = S;

export const assertMaybeEquality = (m1: Maybe, m2: Maybe) => {
  assert(m1.equals(m2), `expected ${m1.value} to equal ${m2.value}`);
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

  describe('ifNil', () => {
    it('returns Nothing if the input is undefined', () => {
      assertIsNothing(ifNil(x => x)(undefined));
    });

    it('returns Nothing if the input is null', () => {
      assertIsNothing(ifNil(x => x)(null));
    });

    it('return func(input) if the input is not nil', () => {
      let result = ifNil(x => x)('test input');
      assert.equal('test input', result);
    });
  });
});
