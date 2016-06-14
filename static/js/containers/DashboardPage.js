/* global SETTINGS: false */
import React from 'react';
import { connect } from 'react-redux';
import Jumbotron from '../components/Jumbotron';
import CourseList from '../components/CourseList';
import ErrorMessage from '../components/ErrorMessage';

class DashboardPage extends React.Component {
  static propTypes = {
    profile:    React.PropTypes.object.isRequired,
    dashboard:  React.PropTypes.object.isRequired,
    dispatch:   React.PropTypes.func.isRequired,
    expander: React.PropTypes.object.isRequired,
  };

  render() {
    const {
      dashboard,
      expander,
      dispatch,
      profile: { profile },
    } = this.props;
    let preferredName = profile.preferredName || SETTINGS.name;
    let errorMessage;
    let dashboardContent;
    // if there are no errors coming from the backend, simply show the dashboard
    if (dashboard.errorInfo === undefined){
      dashboardContent = <div>
        <div className="card-header">
          Your Status
        </div>
        <div className="card-copy">
          <CourseList dashboard={dashboard} expander={expander} dispatch={dispatch} />
        </div>
      </div>;
    } else {
      errorMessage = <ErrorMessage errorInfo={dashboard.errorInfo} />;
    }
    return (
      <Jumbotron profile={profile} text={preferredName}>
        <div>
          {errorMessage}
          {dashboardContent}
        </div>
      </Jumbotron>
    );
  }
}

const mapStateToProps = (state) => {
  let profile = {
    profile: {}
  };
  if (state.profiles[SETTINGS.username] !== undefined) {
    profile = state.profiles[SETTINGS.username];
  }

  return {
    profile: profile,
    dashboard: state.dashboard,
    expander: state.ui.dashboardExpander
  };
};

export default connect(mapStateToProps)(DashboardPage);
