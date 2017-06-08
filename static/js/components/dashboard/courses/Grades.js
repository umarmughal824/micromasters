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
import GradeDetailPopup from './GradeDetailPopup';
import type { DialogVisibilityState } from '../../../reducers/ui';
import { GRADE_DETAIL_DIALOG } from '../../../constants';

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
  course:                   Course,
  setShowGradeDetailDialog: (b: boolean, t: string) => void,
  dialogVisibility:         DialogVisibilityState,
}

const Grades = (props: CourseGradeProps) => {
  const {
    course,
    setShowGradeDetailDialog,
    dialogVisibility,
  } = props;

  return <div className="course-grades">
    <GradeDetailPopup
      course={course}
      setShowGradeDetailDialog={setShowGradeDetailDialog}
      dialogVisibility={dialogVisibility[`${GRADE_DETAIL_DIALOG}${course.title}`] === true}
    />
    <div
      className="grades"
      onClick={() => setShowGradeDetailDialog(true, course.title)}
    >
      { renderEdXGrade(course) }
      { renderExamGrade(course) }
      { renderFinalGrade(course) }
    </div>
    { renderPassed(course) }
  </div>;
};

export default Grades;
