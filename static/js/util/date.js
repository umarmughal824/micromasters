// @flow
import R from 'ramda';

export const ifValidDate = R.curry((defaultValue, fn, date) => (
  date.isValid() ? fn(date) : defaultValue
));
