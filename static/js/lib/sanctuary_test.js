// @flow
import { assert } from 'chai';
import R from 'ramda';

import { S, allJust, mstr, ifNil, guard, getm } from './sanctuary';
const { Maybe, Just, Nothing } = S;

export const assertMaybeEquality = (m1: Maybe, m2: Maybe) => {
  assert(m1.equals(m2), `expected ${m1.value} to equal ${m2.value}`);
};

export const assertIsNothing = (m: Maybe) => {
  assert(m.isNothing, `should be nothing, is ${m}`);
};

export const assertIsJust = (m: Maybe, val: any) => {
  assert(m.isJust, `should be Just(${val}), is ${m}`);
  assert.deepEqual(m.value, val);
};

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

  describe('guard', () => {
    let wrappedFunc = guard(x => x + 2);
    let wrappedRestFunc = guard((x, y, z) => [x, y, z]);

    it('takes a function and returns a function', () => {
      assert.isFunction(wrappedFunc);
      assert.isFunction(wrappedRestFunc);
    });

    it('returns a function that returns Nothing if any arguments are nil', () => {
      assertIsNothing(wrappedFunc(null));
      assertIsNothing(wrappedFunc(undefined));
    });

    it('returns a function that returns the Just(fn(args)) if no args are undefined', () => {
      assertIsJust(wrappedFunc(2), 4);
    });

    it('accepts rest parameters', () => {
      assertIsJust(wrappedRestFunc(1,2,3), [1,2,3]);
    });

    it('returns Nothing if any rest parameter arg is undefined', () => {
      let args = [1,2,3];
      [null, undefined].forEach(nilVal => {
        for (let i = 0; i < 3; i++) {
          assertIsNothing(wrappedRestFunc(...R.update(i, nilVal, args)));
        }
      });
    });
  });

  describe('getm', () => {
    it('returns Nothing if a prop is not present', () => {
      assertIsNothing(getm('prop', {}));
    });

    [null, undefined].forEach(nil => {
      // $FlowFixMe
      it(`returns Nothing if a prop is ${nil}`, () => {
        assertIsNothing(getm('prop', {'prop': nil}));
      });
    });

    it('returns Just(val) if a prop is present', () => {
      assertIsJust(getm('prop', {prop: 'HI'}), 'HI');
    });
  });
});
