// @flow
import React from 'react';
import R from 'ramda';
import Icon from 'react-mdl/lib/Icon';

import type { Course } from '../../../flow/programTypes';
import { formatGrade } from '../util';
import { S, reduceM } from '../../../lib/sanctuary';
import { classify } from '../../../util/util';
import {
  getLargestExamGrade,
  getLargestEdXGrade,
  calculateFinalGrade,
  passedCourse,
} from '../../../lib/grades';
import { hasPearsonExam } from './util';

const renderGrade = R.curry((caption, grade) => (
  <div className={`grade-display ${classify(caption)}`}>
    <div className="number" key={`${caption}number`}>
      { grade }
    </div>
    <div className="caption" key={`${caption}caption`}>
      { caption }
    </div>
  </div>
));

const renderExamGrade = R.ifElse(
  hasPearsonExam,
  R.compose(
    reduceM('--', renderGrade('Exam Grade')),
    S.map(formatGrade),
    getLargestExamGrade,
  ),
  R.always(null),
);

const renderEdXGrade = R.compose(
  reduceM('--', renderGrade('edX Grade')),
  S.map(formatGrade),
  getLargestEdXGrade,
);

const renderFinalGrade = R.ifElse(
  hasPearsonExam,
  R.compose(
    reduceM('--', renderGrade('Final Grade')),
    S.map(formatGrade),
    calculateFinalGrade,
  ),
  R.always(null),
);

const renderPassed = (course: Course) => {
  if (passedCourse(course)) {
    return <div className="passed-course">
      <div className="check-mark-surround">
        <Icon name="check" />
      </div>
      Passed
    </div>;
  } else {
    return null;
  }
};

type CourseGradeProps = {
  course: Course,
}

const Grades = ({ course }: CourseGradeProps) => (
  <div className="course-grades">
    <div className="grades">
      { renderEdXGrade(course) }
      { renderExamGrade(course) }
      { renderFinalGrade(course) }
    </div>
    { renderPassed(course) }
  </div>
);

export default Grades;
