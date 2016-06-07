import React from 'react';
import Grid, { Cell } from 'react-mdl/lib/Grid';

import ProfileFormFields from '../util/ProfileFormFields';
import PersonalForm from './PersonalForm';

class PersonalTab extends ProfileFormFields {
  nextUrl = "/profile/education";

  static propTypes = {
    profile:        React.PropTypes.object,
    errors:         React.PropTypes.object,
    saveProfile:    React.PropTypes.func,
    updateProfile:  React.PropTypes.func,
  };

  render() {
    return <div>
      <Grid className="profile-splash">
        <Cell col={12}>
          Please tell us more about yourself so you can participate in the MicroMaster’s
          community and qualify for your MicroMaster’s credential.
        </Cell>
      </Grid>
      <Grid className="profile-tab-grid">
        <Cell col={1} />
        <Cell col={10}>
          <PersonalForm {...this.props} />
        </Cell>
        <Cell col={1} />
        <Cell col={1} />
        <Cell col={10}>
          {this.progressControls()}
        </Cell>
        <Cell col={1} />
      </Grid>
    </div>;
  }
}

export default PersonalTab;
