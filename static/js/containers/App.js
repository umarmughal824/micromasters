/* global SETTINGS: false */
import React from 'react';
import { connect } from 'react-redux';

import Header from '../components/Header';
import {
  FETCH_SUCCESS,
  fetchCourseList,
  clearCourseList,
  fetchUserProfile,
  clearProfile,
  fetchDashboard,
  clearDashboard,
} from '../actions/index';

const TERMS_OF_SERVICE_REGEX = /\/terms_of_service\/?/;

class App extends React.Component {
  componentDidMount() {
    this.fetchCourseList();
    this.fetchUserProfile(SETTINGS.username);
    this.fetchDashboard();
    this.requireTermsOfService();
  }

  componentDidUpdate() {
    this.fetchCourseList();
    this.fetchUserProfile(SETTINGS.username);
    this.fetchDashboard();
    this.requireTermsOfService();
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
    const { userProfile, dispatch } = this.props;
    if (userProfile.getStatus === undefined) {
      dispatch(fetchUserProfile(username));
    }
  }

  fetchDashboard() {
    const { dashboard, dispatch } = this.props;
    if (dashboard.fetchStatus === undefined) {
      dispatch(fetchDashboard());
    }
  }

  requireTermsOfService() {
    const { userProfile, location: { pathname }, history } = this.props;
    if (
      userProfile.getStatus === FETCH_SUCCESS &&
      !userProfile.profile.agreed_to_terms_of_service &&
      !(TERMS_OF_SERVICE_REGEX.test(pathname))
    ) {
      history.push('/terms_of_service');
    }
  }

  render() {
    const { children, location: { pathname } } = this.props;

    let empty = false;
    if (TERMS_OF_SERVICE_REGEX.test(pathname)) {
      empty = true;
    }

    return (
      <div className="app-media layout-boxed">
        <Header empty={empty} />
        <div className="main-content">
          {children}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    courseList: state.courseList,
    userProfile: state.userProfile,
    dashboard: state.dashboard,
  };
};

App.propTypes = {
  courseList: React.PropTypes.object.isRequired,
  children:   React.PropTypes.object.isRequired,
  userProfile:    React.PropTypes.object.isRequired,
  dashboard:  React.PropTypes.object.isRequired,
  dispatch:   React.PropTypes.func.isRequired,
  history: React.PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(App);
