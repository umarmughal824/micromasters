/* global SETTINGS: false */
import React from 'react';
import CourseList from './CourseList';
import UserImage from './UserImage';

class Dashboard extends React.Component {

  render() {
    const { courseList, profile } = this.props;
    return <div className="main-content">
      <div className="card">
        <div className="card-user">
          <div className="card-image-box">
              <UserImage imageUrl={profile.profile_url_large}/>
          </div>
          <div className="card-name">
            { SETTINGS.name }
          </div>
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
  courseList: React.PropTypes.array.isRequired,
  profile: React.PropTypes.object.isRequired
};

export default Dashboard;