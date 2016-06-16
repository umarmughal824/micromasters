// @flow
import React from 'react';
import Grid, { Cell } from 'react-mdl/lib/Grid';

import EmploymentForm from './EmploymentForm';
import ProfileProgressControls from './ProfileProgressControls';
import {
  employmentValidation,
  employmentUiValidation,
  combineValidators,
} from '../util/validation';
import type { Profile } from '../flow/profileTypes';
import type { UIState } from '../reducers/ui';

class EmploymentTab extends React.Component {
  props: {
    saveProfile:  Function,
    profile:      Profile,
    ui:           UIState,
  };

  render () {
    const { saveProfile, profile, ui } = this.props;
    return (
      <div>
        <Grid className="profile-splash">
          <Cell col={12}>
            Tell us about your employment.
          </Cell>
        </Grid>
        <Grid className="profile-tab-grid">
          <Cell col={1}></Cell>
          <Cell col={10}>
            <EmploymentForm {...this.props} showSwitch={true} />
          </Cell>
          <Cell col={1}></Cell>
          <Cell col={1}></Cell>
          <Cell col={10}>
            <ProfileProgressControls
              prevUrl="/profile/education"
              nextUrl="/profile/privacy"
              saveProfile={saveProfile}
              profile={profile}
              ui={ui}
              validator={combineValidators(employmentValidation, employmentUiValidation)}
            />
          </Cell>
          <Cell col={1}></Cell>
        </Grid>
      </div>
    );
  }
}

export default EmploymentTab;
