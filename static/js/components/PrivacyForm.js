// @flow
/* global SETTINGS: false */
import React from 'react';

import ProfileFormFields from '../util/ProfileFormFields';
import type { Profile, ValidationErrors, UpdateProfileFunc } from '../flow/profileTypes';
import type { UIState } from '../reducers/ui';

class PrivacyForm extends ProfileFormFields {
  props: {
    profile:        Profile,
    ui:             UIState,
    updateProfile:  UpdateProfileFunc,
    errors:         ValidationErrors,
  };

  render() {
    const emailOptions = [
      { value: "true", label: "Faculty and staff can send me emails"},
      { value: "false", label: "I don't want to receive any emails" }
    ];
    return (
      <div>
        <h4 className="privacy-form-heading">Who can see your profile?</h4>
        { this.boundRadioGroupField(['account_privacy'], '', this.privacyOptions) }
        <h4 className="privacy-form-heading">Email Preferences</h4>
        { this.boundRadioGroupField(['email_optin'], '', emailOptions) }
      </div>
    );
  }
}

export default PrivacyForm;
