import React from 'react';
import Button from 'react-mdl/lib/Button';
import Grid, { Cell } from 'react-mdl/lib/Grid';

import ProfileTab from "../util/ProfileTab";

class PrivacyTab extends ProfileTab {
  constructor(props) {
    super(props);
  }
  nextUrl = "/dashboard";

  static propTypes = {
    profile:        React.PropTypes.object,
    saveProfile:    React.PropTypes.func,
    updateProfile:  React.PropTypes.func
  };

  static defaultProps = {
    requiredFields: [
      ['account_privacy']
    ],
    validationMessages: {
      'account_privacy': 'Privacy level'
    }
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
            <Button raised colored className="profile-save-and-continue" onClick={this.saveAndContinue}>
              I’m Done!
            </Button>
          </Cell>
        </Grid>
      </div>
    );
  }
}

export default PrivacyTab;
