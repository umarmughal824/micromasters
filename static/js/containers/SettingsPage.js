// @flow
/* global SETTINGS: false */
import React from 'react';
import { connect } from 'react-redux';
import Loader from 'react-loader';
import Grid, { Cell } from 'react-mdl/lib/Grid';

import Jumbotron from '../components/Jumbotron';
import {
  startProfileEdit,
  FETCH_PROCESSING,
} from '../actions/index';
import ProfileFormContainer from './ProfileFormContainer';
import PrivacyForm from '../components/PrivacyForm';
import ProfileProgressControls from '../components/ProfileProgressControls';
import {
    combineValidators,
    privacyValidation,
} from '../util/validation';
import { getPreferredName } from '../util/util';
import type { Profile } from '../flow/profileTypes';
import type { UIState } from '../reducers/ui';

class SettingsPage extends ProfileFormContainer {
  props: {
    profiles: {[key: string]: Profile},
    dispatch: Function,
    ui:       UIState,
  };

  componentWillMount() {
    this.startSettingsEdit();
  }

  startSettingsEdit() {
    const { dispatch } = this.props;
    dispatch(startProfileEdit(SETTINGS.username));
  }

  render() {
    const { profiles, ui } = this.props;
    let profile;
    let errors;
    let isEdit = true;
    let loaded = false;
    let username = SETTINGS.username;
    let preferredName = SETTINGS.name;
    
    if (profiles[username] !== undefined) {
      let profileFromStore = profiles[username];
      loaded = profileFromStore.getStatus !== FETCH_PROCESSING;
      if (profileFromStore.edit !== undefined) {
        errors = profileFromStore.edit.errors;
        profile = profileFromStore.edit.profile;
      } else {
        profile = profileFromStore.profile;
        errors = {};
        isEdit = false;
      }
      preferredName = getPreferredName(profile);
    }

    return (
      <Loader loaded={loaded}>
        <Jumbotron profile={profile} text={preferredName}>
          <div className="card-copy">
            <Grid className="profile-tab-grid privacy-form">
              <Cell col={12}>
                <PrivacyForm
                  {...this.props}
                  errors={errors}
                  profile={profile}
                  updateProfile={this.updateProfile.bind(this, isEdit)}
                />
              </Cell>
              <Cell col={12}>
                <ProfileProgressControls
                  nextUrl="/dashboard"
                  isLastTab={true}
                  saveProfile={this.saveProfile.bind(this, isEdit)}
                  profile={profile}
                  ui={ui}
                  validator={
                    combineValidators(privacyValidation)
                  }
                />
              </Cell>
            </Grid>
          </div>
        </Jumbotron>
      </Loader>
    );
  }
}

export default connect(ProfileFormContainer.mapStateToProps)(SettingsPage);
