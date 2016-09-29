// @flow
import R from 'ramda';
import { create, env } from 'sanctuary';

const checkTypes = process.env.NODE_ENV !== 'production';
export const S = create({ checkTypes: checkTypes, env: env });

/*
 * returns Just(items) if all items are Just, else Nothing
 */
export const allJust = R.curry((items: S.Maybe[]) => (
  R.all(S.isJust)(items) ? S.Just(items) : S.Nothing()
));

/*
 * converts a Maybe<String> to a string
 */
export const mstr = S.maybe("", String);
