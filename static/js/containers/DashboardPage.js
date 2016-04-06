/* global SETTINGS: false */
import React from 'react';
import { connect } from 'react-redux';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import {
  fetchCourseList,
  clearCourseList,
  fetchUserProfile,
  clearProfile
} from '../actions/index';

class DashboardPage extends React.Component {
  componentDidMount() {
    this.fetchCourseList();
    this.fetchUserProfile(SETTINGS.username);
  }

  componentDidUpdate() {
    this.fetchCourseList();
    this.fetchUserProfile(SETTINGS.username);
  }

  componentWillUnmount() {
    const { dispatch, profile } = this.props;
    dispatch(clearCourseList());
    dispatch(clearProfile());
  }

  fetchCourseList() {
    const { courseList, dispatch } = this.props;
    if (courseList.courseListStatus === undefined) {
      dispatch(fetchCourseList());
    }
  }
  fetchUserProfile(username) {
    const { profile, dispatch } = this.props;
    if (profile.userProfileStatus === undefined) {
      dispatch(fetchUserProfile(username));
    }
  }

  render() {
    const { courseList, profile } = this.props;
    return <div>
      <Header />
      <Dashboard courseList={courseList.courseList} profile={profile.profile}/>
    </div>;
  }
}

const mapStateToProps = (state) => {
  return {
    courseList: state.courseList,
    profile: state.userProfile
  };
};

DashboardPage.propTypes = {
  courseList: React.PropTypes.object.isRequired,
  profile: React.PropTypes.object.isRequired,
  dispatch: React.PropTypes.func.isRequired
};

export default connect(mapStateToProps)(DashboardPage);
