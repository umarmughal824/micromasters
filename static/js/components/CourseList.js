import React from 'react';

import { makeCourseStatusDisplay } from '../util/util';

class CourseList extends React.Component {
  render() {
    const { dashboard, courseList } = this.props;
    let dashboardLookup = {};
    for (let course of dashboard.courses) {
      dashboardLookup[course.id] = course;
    }

    let tables = courseList.programList.map(program => {
      let courses = courseList.courseList.
        filter(course => course.program === program.id).
        map(course => dashboardLookup[course.id]).
        filter(course => course);

      return <div key={program.id}>
        <ul className="course-list-header">
          <li>{program.title}</li>
          <li />
        </ul>
        {
          courses.map(course =>
            <ul key={course.id} className={"course-list-status-" + course.status}>
              <li>
              {course.title}
              </li>
              <li>
              {makeCourseStatusDisplay(course)}
              </li>
            </ul>
          )
        }
      </div>;
    });

    return <div className="course-list">
      {tables}
    </div>;
  }
}

CourseList.propTypes = {
  courseList: React.PropTypes.object.isRequired,
  dashboard: React.PropTypes.object.isRequired,
};

export default CourseList;