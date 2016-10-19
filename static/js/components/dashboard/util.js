// @flow
import ReactTooltip from 'react-tooltip';
import IconButton from 'react-mdl/lib/IconButton';
import React from 'react';
import moment from 'moment';
import _ from 'lodash';

export const courseListToolTip = (text: string, id: string) => (
  <div>
    <span className="tooltip-link"
      data-tip
      data-for={ id }>
      <IconButton name="help" className="help"/>
    </span>
    <ReactTooltip id={ id } effect="solid"
      event="click" globalEventOff="click" className="tooltip">
      { text }
    </ReactTooltip>
  </div>
);

export const isCurrentlyEnrollable = (enrollmentStartDate: ?moment$Moment, now: ?moment$Moment): boolean => (
  enrollmentStartDate !== null &&
    enrollmentStartDate !== undefined &&
    enrollmentStartDate.isSameOrBefore(now || moment(), 'day')
);

export const formatGrade = (grade: number|string|null): string => {
  if (_.isNil(grade) || grade === '') {
    return '';
  } else {
    grade = Number(grade);
    // isFinite will return true for numbers, false for strings and NaN
    return _.isFinite(grade) ? `${_.round(grade)}%` : '';
  }
};
