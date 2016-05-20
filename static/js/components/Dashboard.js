/* global SETTINGS: false */
import React from 'react';
import Grid, { Cell } from 'react-mdl/lib/Grid';

import CourseList from './CourseList';
import { makeProfileImageUrl } from '../util/util';

class Dashboard extends React.Component {
  static propTypes = {
    profile:    React.PropTypes.object.isRequired,
    dashboard:  React.PropTypes.object.isRequired,
    expander: React.PropTypes.object.isRequired,
    dispatch: React.PropTypes.func.isRequired,
  };

  render() {
    const { profile, dashboard, expander, dispatch } = this.props;
    let imageUrl = makeProfileImageUrl(profile);
    return <div className="card">
      <Grid className="card-user">
        <Cell col={2} className="card-image-box">
          <img
            src={imageUrl}
            alt={`Profile image for ${SETTINGS.name}`}
            className="card-image"
            style={{
              marginLeft: "50px"
            }}
          />
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
