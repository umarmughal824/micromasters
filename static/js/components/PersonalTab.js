import React from 'react';
import Button from 'react-mdl/lib/Button';

import { boundTextField, boundSelectField, saveAndContinue } from '../util/profile_edit';
import { LANGUAGE_CODES } from '../language_codes';

class PersonalTab extends React.Component {
  constructor(props) {
    super(props);
    this.boundTextField = boundTextField.bind(this);
    this.boundSelectField = boundSelectField.bind(this);
    this.genderOptions = [
      { value: 'm', label: 'Male' },
      { value: 'f', label: 'Female' },
      { value: 'o', label: 'Other/Prefer not to say' }
    ];
    this.languageOptions = LANGUAGE_CODES.map(language => ({
      value: language.alpha2,
      label: language.English
    }));
    this.saveAndContinue = saveAndContinue.bind(this, '/dashboard');
  }

  render() {
    const { errors } = this.props;
    return <div>
      {this.boundTextField("first_name", "Given name", errors.first_name)}<br />
        {this.boundTextField("last_name", "Family name", errors.last_name)}<br />
        {this.boundTextField("preferred_name", "Preferred name", errors.preferred_name)}<br />
        {this.boundSelectField('gender', 'Gender', this.genderOptions, errors.gender)}<br />
        {this.boundSelectField(
          'preferred_language',
          'Preferred language',
          this.languageOptions,
          errors.preferred_language
        )}<br />
      <Button raised onClick={this.saveAndContinue}>
        Save and continue
      </Button>
    </div>;
  }
}

PersonalTab.propTypes = {
  profile:        React.PropTypes.object,
  errors:         React.PropTypes.object,
  saveProfile:    React.PropTypes.func,
  updateProfile:  React.PropTypes.func,
};

export default PersonalTab;
