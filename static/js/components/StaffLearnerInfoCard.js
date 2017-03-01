// @flow
import React from 'react';
import { Card, CardTitle } from 'react-mdl/lib/Card';

import { circularProgressWidget } from './ProgressWidget';
import { programCourseInfo } from '../util/util';
import type { Program } from '../flow/programTypes';

type StaffLearnerCardProps = {
  program: Program,
};

const StaffLearnerInfoCard = (props: StaffLearnerCardProps) => {
  const { program } = props;
  const { totalPassedCourses, totalCourses } = programCourseInfo(program);

  return (
    <Card shadow={1} className="staff-learner-info-card">
      <CardTitle>
        { `Progress - ${program.title}` }
      </CardTitle>
      <div className="program-info">
        <div className="row">
          <div className="progress-widget">
            { circularProgressWidget(63, 7, totalPassedCourses, totalCourses) }
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StaffLearnerInfoCard;
