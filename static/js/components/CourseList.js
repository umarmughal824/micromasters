import React from 'react';
import _ from 'lodash';
import Button from 'react-bootstrap/lib/Button';

import {
  makeCourseStatusDisplay,
  makeCourseProgressDisplay,
} from '../util/util';
import { STATUS_PASSED } from '../constants';

class CourseList extends React.Component {
  render() {
    const { dashboard } = this.props;

    let programs = dashboard.programs.map(program => {
      let sortedCourses = _.sortBy(program.courses, 'position_in_program');
      let totalCourses = program.courses.length;
      let coursesPassed = 0;

      let table = sortedCourses.map((course, i) => {
        let isTop = i === 0;
        let isBottom = i === sortedCourses.length - 1;

        if (course.status === STATUS_PASSED) {
          coursesPassed++;
        }

        return <ul
          key={course.id}
          className={"course-list-body course-list-status-" + course.status}
        >
          <li className="course-title">
            {course.title}
          </li>
          <li className="course-status">
            {makeCourseStatusDisplay(course)}
          </li>
          <li className="course-progress">
            {makeCourseProgressDisplay(course, isTop, isBottom)}
          </li>
        </ul>;
      });

      return (
        <div key={program.id}>
          <div className="course-list">
            <ul className="course-list-header">
              <li className="course-title">
                {program.title}
              </li>
              <li className="course-status "/>
              <li className="course-progress">
                Progress
              </li>
            </ul>
            {table}
          </div>
          <div className="clear-float apply-for-ms">
            <br/>
            <p>You need to pass {totalCourses - coursesPassed} more courses
              before you can apply for <strong>{program.title}</strong> Master's Degree.</p>
            <Button bsStyle="primary" disabled>Apply for <strong>{program.title}</strong> Master Degree</Button>
          </div>
        </div>
      );
    });

    return <div>
      {programs}
    </div>;
  }
}

CourseList.propTypes = {
  dashboard: React.PropTypes.object.isRequired,
};

export default CourseList;