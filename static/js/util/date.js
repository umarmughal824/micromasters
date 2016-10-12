// @flow
import R from 'ramda';

export const ifValidDate = R.curry((def, fn, date) => (
  date.isValid() ? fn(date) : def
));
