import React from 'react';
import CourseList from './CourseList';

class Dashboard extends React.Component {

  render() {
    const { courseList } = this.props;
    return <div className="main-content">
      <div className="card">
        <div className="card-image">
          Samantha Davies
        </div>
        <div className="card-header">
          Your Status
        </div>
        <div className="card-copy">
          <CourseList courseList={courseList}/>
        </div>
      </div>
    </div>;
  }
}

Dashboard.propTypes = {
  courseList: React.PropTypes.array.isRequired
};

export default Dashboard;