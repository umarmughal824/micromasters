// @flow
import R from 'ramda';
import S, { Maybe, Just, Nothing } from 'sanctuary';

/*
 * returns Just(items) if all items are Just, else Nothing
 */
export const allJust = R.curry((items: Maybe[]) => (
  R.all(S.isJust)(items) ? Just(items) : Nothing()
));

/*
 * converts a Maybe<String> to a string
 */
export const mstr = S.maybe("", String);
