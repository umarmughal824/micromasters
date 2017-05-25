/* global SETTINGS: false */
// @flow
import React from 'react';
import _ from 'lodash';
import R from 'ramda';

import type { CourseRun, Course } from '../../flow/programTypes';
import { formatGrade } from './util';
import { EDX_LINK_BASE } from '../../constants';
import { S, getm } from '../../lib/sanctuary';

const findLargestGrade = R.compose(
  R.prop('percentage_grade'),
  R.reduce(
    R.maxBy(R.prop('percentage_grade')), { 'percentage_grade': 0 }
  ),
);

const renderGrade = R.curry((caption, grade) => ([
  <div className="number" key={`${caption}number`}>
    { grade }
  </div>,
  <div className="caption" key={`${caption}caption`}>
    { caption }
  </div>
]));

const renderExamGrade = R.compose(
  S.maybe(null, renderGrade('Exam Grade')),
  S.map(formatGrade),
  S.map(percentage => percentage * 100),
  S.map(findLargestGrade),
  S.filter(R.compose(R.not, R.isEmpty)),
  getm('proctorate_exams_grades')
);

export default class CourseGrade extends React.Component {
  props: {
    courseRun: CourseRun,
    course?:   Course,
  };

  renderCourseProgressLink = (courseRun: CourseRun, grade: number|string|null): React$Element<*>|null => (
    <a href={`${EDX_LINK_BASE}${courseRun.course_id}/progress`} target="_blank" rel="noopener noreferrer">
      {formatGrade(grade)}
    </a>
  );

  render() {
    const { courseRun, course } = this.props;

    let grade, caption;
    if (!_.isNil(courseRun.final_grade)) {
      grade = courseRun.final_grade;
      caption = 'edX grade';
    } else if (!_.isNil(courseRun.current_grade)) {
      grade = courseRun.current_grade;
      caption = 'edX Progress';
    }

    if (grade && caption) {
      return <div className="course-grade">
        { R.isNil(course) ? null : renderExamGrade(course) }
        { renderGrade(caption, this.renderCourseProgressLink(courseRun, grade)) }
      </div>;
    } else {
      return null;
    }
  }
}
