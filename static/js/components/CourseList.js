import React from 'react';
import _ from 'lodash';

import { makeCourseStatusDisplay } from '../util/util';

class CourseList extends React.Component {
  render() {
    const { dashboard } = this.props;

    let sortedCourses = _.sortBy(dashboard.courses, 'position_in_program');

    let table = sortedCourses.map(course => {
      // id number is not guaranteed to exist here so we need to use the whole
      // object to test uniqueness
      // TODO: fix this when we refactor
      return <ul
        key={JSON.stringify(course)}
        className={"course-list-status-" + course.status}
      >
        <li>
          {course.title}
        </li>
        <li>
          {makeCourseStatusDisplay(course)}
        </li>
      </ul>;
    });

    return <div className="course-list">
      <ul className="course-list-header">
        <li />
        <li />
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