/* global SETTINGS: false */
import React from 'react';
import { connect } from 'react-redux';
import Dashboard from '../components/Dashboard';

class DashboardPage extends React.Component {
  render() {
    const { courseList, profile, dashboard } = this.props;
    return <Dashboard
      courseList={courseList}
      profile={profile.profile}
      dashboard={dashboard}
    />;
  }
}

const mapStateToProps = (state) => {
  return {
    courseList: state.courseList,
    profile: state.userProfile,
    dashboard: state.dashboard,
  };
};

DashboardPage.propTypes = {
  courseList: React.PropTypes.object.isRequired,
  profile: React.PropTypes.object.isRequired,
  dashboard: React.PropTypes.object.isRequired,
  dispatch: React.PropTypes.func.isRequired
};

export default connect(mapStateToProps)(DashboardPage);
