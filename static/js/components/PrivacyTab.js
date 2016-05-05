import React from 'react';
import Button from 'react-mdl/lib/Button';

import ProfileTab from "../util/ProfileTab";
import { saveAndContinue } from "../util/profile_edit";

class PrivacyTab extends ProfileTab {
  constructor(props) {
    super(props);
    this.saveAndContinue = saveAndContinue.bind(this, '/dashboard');
  }

  static propTypes = {
    profile:        React.PropTypes.object,
    errors:         React.PropTypes.object,
    saveProfile:    React.PropTypes.func,
    updateProfile:  React.PropTypes.func
  };

  static defaultProps = {
    requiredFields: [
      ['account_privacy']
    ],
    validationMessages: {
      'account_privacy': 'Privacy'
    }
  };

  render() {
    return <div>
      <h4>Micromasters learners can see my:</h4>
      {this.boundSelectField(['account_privacy'], 'Privacy', this.privacyOptions)}<br />
      <br />
      <Button raised onClick={this.saveAndContinue}>
        Save and continue
      </Button>
    </div>;
  }
}

export default PrivacyTab;