// @flow
import moment from 'moment';

import type { WorkHistoryEntry } from '../flow/profileTypes';

export function resumeOrder(entries: WorkHistoryEntry[], dateFieldName: string): WorkHistoryEntry[] {
  let sortFunc = (a, b) => {
    let adate = moment(a[dateFieldName]);
    let bdate = moment(b[dateFieldName]);
    if ( adate.isBefore(bdate) ) {
      return 1;
    }
    if ( adate.isAfter(bdate) ) {
      return -1;
    }
    return 0;
  };
  return entries.sort(sortFunc);
}

export function sortWorkEntriesByDate(entries: Array<WorkHistoryEntry>): Array<WorkHistoryEntry> {
  let sorted = [];
  sorted.push(...resumeOrder(entries.filter(entry => entry.end_date === null), 'start_date'));
  sorted.push(...resumeOrder(entries.filter(entry => entry.end_date !== null), 'end_date'));
  return sorted;
}
