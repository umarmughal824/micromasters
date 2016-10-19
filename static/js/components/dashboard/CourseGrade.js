// @flow
import React from 'react';
import _ from 'lodash';

import type { CourseRun } from '../../flow/programTypes';
import { formatGrade } from './util';

export default class CourseGrade extends React.Component {
  props: {
    courseRun: CourseRun
  };

  render() {
    const { courseRun } = this.props;

    let grade, caption;
    if (!_.isNil(courseRun.final_grade)) {
      grade = courseRun.final_grade;
      caption = 'Final grade';
    } else if (!_.isNil(courseRun.current_grade)) {
      grade = courseRun.current_grade;
      caption = 'Current grade';
    }

    if (grade && caption) {
      return <div className="course-grade">
        <div className="number">{formatGrade(grade)}</div>
        <div className="caption">{caption}</div>
      </div>;
    } else {
      return null;
    }
  }
}
