// @flow
import { assert } from 'chai';
import moment from 'moment';

import { ifValidDate } from './date';

describe('ifValidDate', () => {
  let formatFunc = date => date.format('YYYY-MM-DD');
  let testFunc = ifValidDate('not valid', formatFunc);

  it('should return the default value for an invalid date', () => {
    let invalidDate = moment('1978-13-39');
    assert.equal('not valid', testFunc(invalidDate));
  });

  it('should return fn(date) for a valid date', () => {
    let validDate = moment('1949-06-02');
    assert.equal('1949-06-02', testFunc(validDate));
  });
});
