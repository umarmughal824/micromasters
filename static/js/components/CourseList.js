import React from 'react';
import _ from 'lodash';

import {
  makeCourseStatusDisplay,
  makeCourseProgressDisplay,
} from '../util/util';

class CourseList extends React.Component {
  render() {
    const { dashboard } = this.props;

    let programs = dashboard.programs.map(program => {
      let sortedCourses = _.sortBy(program.courses, 'position_in_program');

      let table = sortedCourses.map((course, i) => {
        let isTop = i === 0;
        let isBottom = i === sortedCourses.length - 1;

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

      return <div key={program.id} className="course-list">
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
      </div>;
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