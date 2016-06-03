import React from 'react';
import Grid, { Cell } from 'react-mdl/lib/Grid';

import ProfileFormFields from '../util/ProfileFormFields';

class PrivacyTab extends ProfileFormFields {
  prevUrl = "/profile/professional";
  nextUrl = "/dashboard";
  isLastTab = true;

  static propTypes = {
    profile:        React.PropTypes.object,
    saveProfile:    React.PropTypes.func,
    updateProfile:  React.PropTypes.func
  };

  render() {
    return (
      <div>
        <Grid className="profile-splash">
          <Cell col={12}>
            We care about your privacy.
          </Cell>
        </Grid>
        <br/><br/>
        <Grid className="profile-tab-grid">
          <Cell col={12}>
            <span className="header-privacy-tab">Who can see your profile?</span>
            { this.boundRadioGroupField(['account_privacy'], '', this.privacyOptions) } <br />
          </Cell>
          <Cell col={12}>
            {this.progressControls()}
          </Cell>
        </Grid>
      </div>
    );
  }
}

export default PrivacyTab;
