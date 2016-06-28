// @flow
import React from 'react';
import Grid, { Cell } from 'react-mdl/lib/Grid';

import PrivacyForm from './PrivacyForm';
import ProfileProgressControls from './ProfileProgressControls';
import ProfileFormFields from '../util/ProfileFormFields';
import {
  combineValidators,
  personalValidation,
  educationValidation,
  employmentValidation,
  privacyValidation,
} from '../util/validation';
import type { Profile } from '../flow/profileTypes';
import type { UIState } from '../reducers/ui';

class PrivacyTab extends ProfileFormFields {
  props: {
    profile:        Profile,
    saveProfile:    () => void,
    updateProfile:  () => void,
    ui:             UIState,
  };

  render() {
    const { saveProfile, profile, ui } = this.props;
    return (
      <div>
        <Grid className="profile-splash">
          <Cell col={12}>
            We care about your privacy.
          </Cell>
        </Grid>
        <Grid className="profile-tab-grid privacy-form">
          <Cell col={12}>
            <PrivacyForm {...this.props} />
          </Cell>
          <Cell col={12}>
            <ProfileProgressControls
              prevUrl="/profile/professional"
              nextUrl="/dashboard"
              isLastTab={true}
              saveProfile={saveProfile}
              profile={profile}
              ui={ui}
              validator={
                combineValidators(
                  personalValidation,
                  educationValidation,
                  employmentValidation,
                  privacyValidation
                )
              }
            />
          </Cell>
        </Grid>
      </div>
    );
  }
}

export default PrivacyTab;
