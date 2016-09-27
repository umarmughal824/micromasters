// @flow
import React from 'react';
import { Card, CardTitle } from 'react-mdl/lib/Card';
import Button from 'react-mdl/lib/Button';

import type {
  Program
} from '../flow/programTypes';
import { programCourseInfo } from '../util/util';

export default class ProgressWidget extends React.Component {
  props: {
    program: Program
  };

  circularProgressWidget: Function = (
    radius: number,
    strokeWidth: number,
    totalPassedCourses: number,
    totalCourses: number
  ): React$Element<*> => {
    const radiusForMeasures = radius - strokeWidth / 2;
    const radiusDots = radiusForMeasures + 7;
    const width = radius * 2.5;
    const height = radius * 2.5;
    const viewBox = `-13 -13 ${width} ${height}`;
    const dashArray = radiusForMeasures * Math.PI * 2;
    const dashOffset = dashArray - dashArray * totalPassedCourses / (totalCourses || 1);

    return (
      <svg className="circular-progress-widget-svg"
        width={radius * 2.5}
        height={radius * 2.5}
        viewBox={viewBox}>
        <path d="M -3 65 h 2 -7" stroke="white" stroke-width="5" fill="white" />
        <path d="M 120 60 h 5 1" stroke="white" stroke-width="5" fill="white" />
        <path d="M 59 -3 v 2 -7" stroke="white" stroke-width="5" fill="white" />
        <path d="M 55 125 v 2 -7" stroke="white" stroke-width="5" fill="white" />
        <circle
          cx={radius}
          cy={radius}
          stroke="white"
          r={radiusDots}
          strokeWidth='5px'
          className="dashed-circle"
          style={{ strokeDasharray: '1, 14' }} />
        <circle
          className="circular-progress-widget-bg"
          cx={radius}
          cy={radius}
          r={radiusForMeasures}
          strokeWidth={`${strokeWidth}px`} />
        <circle
          className="circular-progress-widget-fg"
          cx={radius}
          cy={radius}
          r={radiusForMeasures}
          strokeWidth={`${strokeWidth}px`}
          style={{
            strokeDasharray: dashArray,
            strokeDashoffset: dashOffset
          }} />
        <text
          className="circular-progress-widget-txt"
          x={radius}
          y={radius}
          dy=".4em"
          textAnchor="middle">
          {`${totalPassedCourses}/${totalCourses}`}
        </text>
      </svg>
    );
  };

  render() {
    const { program } = this.props;
    const { totalPassedCourses, totalCourses } = programCourseInfo(program);

    return (
      <Card className="progress-widget" shadow={0}>
        <CardTitle className="progress-title">Progress</CardTitle>
        <div className="circular-progress-widget">
          {this.circularProgressWidget(60, 6, totalPassedCourses, totalCourses)}
        </div>
        <p className="text-course-complete">Courses complete</p>
        <p className="heading-paragraph">
          On completion, you can apply for
          the Masters Degree Program</p>
        <div className="apply-master-btn">
           <Button className="progress-button disabled">
             Apply for Masters
           </Button>
        </div>
      </Card>
    );
  }
}
