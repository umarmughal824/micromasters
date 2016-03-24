import React from 'react';

class CourseList extends React.Component {
  render() {
    const { courseList } = this.props;

    return <ul className="course-list">
      {
        courseList.map(function(course) {
          return <li key={course.id}>{course.title}</li>;
        })
      }
    </ul>;
  }
}

export default CourseList;