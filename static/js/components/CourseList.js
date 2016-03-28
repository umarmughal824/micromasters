import React from 'react';

class CourseList extends React.Component {
  render() {
    const { courseList } = this.props;

    return <ul className="course-list">
      {
        courseList.map(course => <li key={course.id}>{course.title}</li>)
      }
    </ul>;
  }
}

CourseList.propTypes = {
  courseList: React.PropTypes.array.isRequired
};

export default CourseList;