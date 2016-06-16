// @flow
import { assert } from 'chai';
import moment from 'moment';

import { resumeOrder, sortWorkEntriesByDate } from './sorting';
import { generateNewWorkHistory } from './util';

let format = 'YYYY-MM';

describe('profile sort functions', () => {
  it('should sort by resume order', () => {
    let entries = ['1969-01', '1997-01', '1992-01', '1934-01'].map(year => (
      { 'end_date': moment(year, format).format(format) }
    ));
    let sorted = resumeOrder(entries, 'end_date');
    let expected = [
      '1997-01',
      '1992-01',
      '1969-01',
      '1934-01',
    ];
    assert.deepEqual(expected, sorted.map(entry => entry.end_date));
  });

  it('should sort employment entries first by "current" and then by resume order', () => {
    let entries = [
      ['1962-12', null],
      ['1923-12', null],
      ['2001-01', '2012-03'],
      ['1962-12', '1963-11'],
      ['1961-08', '1982-01'],
      ['2001-12', null],
    ].map(([start, end]) => {
      let entry = generateNewWorkHistory();
      entry.start_date = moment(start, format).format(format);
      entry.end_date = end ? moment(end, format).format(format) : null;
      return entry;
    });
    let sorted = sortWorkEntriesByDate(entries);

    // null end date (current position) jobs come first
    sorted.slice(0, 3).forEach(entry => (
      assert.isNull(entry.end_date)
    ));

    // finished (non-current) jobs at the end
    sorted.slice(3,6).forEach(entry => (
      assert.isNotNull(entry.end_date)
    ));

    // check overall date order
    let expectedDateOrder = [
      ['2001-12', null],
      ['1962-12', null],
      ['1923-12', null],
      ['2001-01', '2012-03'],
      ['1961-08', '1982-01'],
      ['1962-12', '1963-11'],
    ];
    let actualDateOrder = sorted.map(entry => ([
      entry.start_date,
      entry.end_date
    ]));
    assert.deepEqual(expectedDateOrder, actualDateOrder);
  });
});
