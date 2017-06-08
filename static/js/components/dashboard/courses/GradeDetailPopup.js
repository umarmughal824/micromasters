// @flow
import Dialog from 'material-ui/Dialog';
import React from 'react';
import R from 'ramda';
import Icon from 'react-mdl/lib/Icon';

import type {
  Course,
  CourseRun,
} from '../../../flow/programTypes';
import { formatGrade } from '../util';
import {
  STATUS_NOT_PASSED,
  STATUS_PASSED,
} from '../../../constants';

const runGrade = (courseRun: CourseRun, isBestGrade: boolean): string|React$Element<*> => {
  if (courseRun.final_grade) {
    if (isBestGrade) {
      return <div className="best-grade">
        { formatGrade(courseRun.final_grade) }
        <Icon name="check" />
      </div>;
    }
    return formatGrade(courseRun.final_grade);
  }
  return "";
};

const runStatus = (courseRun: CourseRun): React$Element<*> => {
  if (courseRun.status === STATUS_NOT_PASSED) {
    return <div className="status failed">
      Not passed
    </div>;
  }
  if (courseRun.status === STATUS_PASSED) {
    return <div className="status passed">
      Passed
    </div>;
  }
  return <div className="status audited">
    Audited
  </div>;
};

const renderRunRow = ([courseRun: CourseRun, isBestGrade: boolean], idx: number) => (
  <div className="course-run-row" key={idx}>
    <div className="title">{ courseRun.title }</div>
    <div className="grade-status">
      <div>{ runStatus(courseRun) }</div>
      <div className="grade">{ runGrade(courseRun, isBestGrade) }</div>
    </div>
  </div>
);

const labelBestGrade = (runs: Array<CourseRun>): Array<[CourseRun, boolean]> => {
  let bestGrade = runs.reduce((acc, run) => (
    run.final_grade && run.final_grade > acc ? run.final_grade : acc
  ), 0);

  return runs.map(run => ([
    run,
    !R.isNil(run.final_grade) && run.final_grade !== 0 && run.final_grade === bestGrade
  ]));
};

const renderRunRows = R.compose(
  R.addIndex(R.map)(renderRunRow),
  labelBestGrade
);

const dialogTitle = (course: Course): string => (
  `${course.title} - completed edX Course runs`
);

type GradeDetailPopupProps = {
  course:                   Course,
  setShowGradeDetailDialog: (b: boolean, t: string) => void,
  dialogVisibility:         boolean,
};

const GradeDetailPopup = (props: GradeDetailPopupProps) => {
  const {
    course,
    setShowGradeDetailDialog,
    dialogVisibility,
  } = props;

  return <Dialog
    className="grade-detail-popup"
    title={dialogTitle(course)}
    titleClassName="grade-dialog-title"
    open={dialogVisibility}
    onRequestClose={() => setShowGradeDetailDialog(false, course.title)}
  >
    { renderRunRows(course.runs) }
    <div className="explanation">
      Only your best passing grade counts toward your final grade
    </div>
  </Dialog>;
};

export default GradeDetailPopup;
