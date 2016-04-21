/* global SETTINGS: false */
import React from 'react';
import { connect } from 'react-redux';
import Header from '../components/Header';
import {
  fetchCourseList,
  clearCourseList,
  fetchUserProfile,
  clearProfile,
  fetchDashboard,
  clearDashboard,
} from '../actions/index';

class App extends React.Component {
  componentDidMount() {
    this.fetchCourseList();
    this.fetchUserProfile(SETTINGS.username);
    this.fetchDashboard();
  }

  componentDidUpdate() {
    this.fetchCourseList();
    this.fetchUserProfile(SETTINGS.username);
    this.fetchDashboard();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(clearCourseList());
    dispatch(clearProfile());
    dispatch(clearDashboard());
  }

  fetchCourseList() {
    const { courseList, dispatch } = this.props;
    if (courseList.fetchStatus === undefined) {
      dispatch(fetchCourseList());
    }
  }
  fetchUserProfile(username) {
    const { profile, dispatch } = this.props;
    if (profile.getStatus === undefined) {
      dispatch(fetchUserProfile(username));
    }
  }

  fetchDashboard() {
    const { dashboard, dispatch } = this.props;
    if (dashboard.fetchStatus === undefined) {
      dispatch(fetchDashboard());
    }
  }

  render() {
    const { children } = this.props;

    return <div>
      <Header />
      <div className="main-content">
        {children}
      </div>
    </div>;
  }
}

const mapStateToProps = (state) => {
  return {
    courseList: state.courseList,
    profile: state.userProfile,
    dashboard: state.dashboard,
  };
};

App.propTypes = {
  courseList: React.PropTypes.object.isRequired,
  children:   React.PropTypes.object.isRequired,
  profile:    React.PropTypes.object.isRequired,
  dashboard:  React.PropTypes.object.isRequired,
  dispatch:   React.PropTypes.func.isRequired
};

export default connect(mapStateToProps)(App);
