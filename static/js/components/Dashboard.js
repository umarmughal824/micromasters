/* global SETTINGS: false */
import React from 'react';
import CourseList from './CourseList';
import UserImage from './UserImage';

class Dashboard extends React.Component {
  static propTypes = {
    profile:    React.PropTypes.object.isRequired,
    dashboard:  React.PropTypes.object.isRequired,
  };

  render() {
    const { profile, dashboard } = this.props;
    let imageUrl = (SETTINGS.edx_base_url + '/static/images/profiles/default_120.png').
    //replacing multiple "/" with a single forward slash, excluding the ones following the colon
    replace(/([^:]\/)\/+/g, "$1");
    if (profile.profile_url_large) {
      imageUrl = profile.profile_url_large;
    }
    return <div className="card">
      <div className="card-user">
        <div className="card-image-box">
            <UserImage imageUrl={imageUrl}/>
        </div>
        <div className="card-name">
          { profile.preferred_name || SETTINGS.name }
          <div className="card-student-id">
            ID: { profile.pretty_printed_student_id }
          </div>
        </div>
      </div>
      <div className="card-header">
        Your Status
      </div>
      <div className="card-copy">
        <CourseList dashboard={dashboard} />
      </div>
    </div>;
  }
}

export default Dashboard;
