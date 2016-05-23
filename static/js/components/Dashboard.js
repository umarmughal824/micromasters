/* global SETTINGS: false */
import React from 'react';
import Grid, { Cell } from 'react-mdl/lib/Grid';
import CourseList from './CourseList';
import UserImage from './UserImage';

class Dashboard extends React.Component {
  static propTypes = {
    profile:    React.PropTypes.object.isRequired,
    dashboard:  React.PropTypes.object.isRequired,
    expander: React.PropTypes.object.isRequired,
    dispatch: React.PropTypes.func.isRequired,
  };

  render() {
    const { profile, dashboard, expander, dispatch } = this.props;
    let imageUrl = `${SETTINGS.edx_base_url}/static/images/profiles/default_120.png`.
    //replacing multiple "/" with a single forward slash, excluding the ones following the colon
    replace(/([^:]\/)\/+/g, "$1");
    if (profile.profile_url_large) {
      imageUrl = profile.profile_url_large;
    }
    return <div className="card">
      <Grid className="card-user">
        <Cell col={2} className="card-image-box">
            <UserImage imageUrl={imageUrl}/>
        </Cell>
        <Cell col={5} className="card-name">
          { profile.preferred_name || SETTINGS.name }
          <div className="card-student-id">
            ID: { profile.pretty_printed_student_id }
          </div>
        </Cell>
      </Grid>
      <div className="card-header">
        Your Status
      </div>
      <div className="card-copy">
        <CourseList dashboard={dashboard} expander={expander} dispatch={dispatch} />
      </div>
    </div>;
  }
}

export default Dashboard;
