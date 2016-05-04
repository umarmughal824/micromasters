/* global SETTINGS: false */
import React from 'react';
import { connect } from 'react-redux';
import Dashboard from '../components/Dashboard';

class DashboardPage extends React.Component {
  render() {
    const { profile, dashboard } = this.props;
    return <Dashboard
      profile={profile.profile}
      dashboard={dashboard}
    />;
  }
}

const mapStateToProps = (state) => {
  return {
    profile: state.userProfile,
    dashboard: state.dashboard,
  };
};

DashboardPage.propTypes = {
  profile: React.PropTypes.object.isRequired,
  dashboard: React.PropTypes.object.isRequired,
  dispatch: React.PropTypes.func.isRequired
};

export default connect(mapStateToProps)(DashboardPage);
