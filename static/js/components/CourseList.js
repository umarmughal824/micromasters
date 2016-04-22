import React from 'react';
import _ from 'lodash';

import {
  makeCourseStatusDisplay,
  makeCourseProgressDisplay,
} from '../util/util';

class CourseList extends React.Component {
  render() {
    const { dashboard } = this.props;

    let sortedCourses = _.sortBy(dashboard.courses, 'position_in_program');

    let table = sortedCourses.map((course, i) => {
      // id number is not guaranteed to exist here so we need to use the whole
      // object to test uniqueness
      // TODO: fix this when we refactor

      let isTop = i === 0;
      let isBottom = i === sortedCourses.length - 1;

      return <ul
        key={JSON.stringify(course)}
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

    return <div className="course-list">
      <ul className="course-list-header">
        <li className="course-title" />
        <li className="course-status " />
        <li className="course-progress">
          Progress
        </li>
      </ul>
      {table}
    </div>;
  }
}

CourseList.propTypes = {
  courseList: React.PropTypes.object.isRequired,
  dashboard: React.PropTypes.object.isRequired,
};

export default CourseList;