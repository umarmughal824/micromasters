/* global SETTINGS: false */
import React from 'react';
import { connect } from 'react-redux';
import Dashboard from '../components/Dashboard';

class DashboardPage extends React.Component {
  static propTypes = {
    profile:    React.PropTypes.object.isRequired,
    dashboard:  React.PropTypes.object.isRequired,
    dispatch:   React.PropTypes.func.isRequired,
    expander: React.PropTypes.object.isRequired,
  };

  render() {
    const { profile, dashboard, expander, dispatch } = this.props;
    return <Dashboard
      profile={profile.profile}
      dashboard={dashboard}
      expander={expander}
      dispatch={dispatch}
    />;
  }
}

const mapStateToProps = (state) => {
  return {
    profile: state.userProfile,
    dashboard: state.dashboard,
    expander: state.ui.dashboardExpander
  };
};

export default connect(mapStateToProps)(DashboardPage);
