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
import type { Profile, SaveProfileFunc } from '../flow/profileTypes';
import type { UIState } from '../reducers/ui';

class EmploymentTab extends React.Component {
  props: {
    saveProfile:  SaveProfileFunc,
    profile:      Profile,
    ui:           UIState,
    nextStep:     () => void,
    prevStep:     () => void,
  };

  render () {
    const validator = combineValidators(employmentValidation, employmentUiValidation);
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
            <EmploymentForm {...this.props} showSwitch={true} validator={validator} />
          </Cell>
          <Cell col={1}></Cell>
          <Cell col={1}></Cell>
          <Cell col={10}>
            <ProfileProgressControls
              {...this.props}
              nextBtnLabel="Save and Continue"
              isLastTab={false}
              validator={validator}
            />
          </Cell>
          <Cell col={1}></Cell>
        </Grid>
      </div>
    );
  }
}

export default EmploymentTab;
