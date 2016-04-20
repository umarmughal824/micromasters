import React from 'react';
import Button from 'react-mdl/lib/Button';

import {
  boundDateField,
  boundTextField,
  boundSelectField,
  saveAndContinue,
} from '../util/profile_edit';
import LANGUAGE_CODES from '../language_codes';
import COUNTRIES from '../countries';

class PersonalTab extends React.Component {
  constructor(props) {
    super(props);
    this.boundTextField = boundTextField.bind(this);
    this.boundSelectField = boundSelectField.bind(this);
    this.boundDateField = boundDateField.bind(this);
    this.genderOptions = [
      { value: 'm', label: 'Male' },
      { value: 'f', label: 'Female' },
      { value: 'o', label: 'Other/Prefer not to say' }
    ];
    this.languageOptions = LANGUAGE_CODES.map(language => ({
      value: language.alpha2,
      label: language.English
    }));
    this.countryOptions = COUNTRIES.map(country => ({
      value: country.Code,
      label: country.Name
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
      <h4>Where do you live?</h4>
      {this.boundTextField('city', 'City', errors.city)}<br />
      {this.boundTextField(
        'state_or_territory',
        'State or Territory',
        errors.state_or_territory
      )}<br />
      {this.boundSelectField('country', 'Country', this.countryOptions, errors.country)}<br />
      <h4>Where were you born?</h4>
      {this.boundTextField('birth_city', 'City', errors.birth_city)}<br />
      {this.boundTextField(
        'birth_state_or_territory',
        'State or Territory',
        errors.birth_state_or_territory
      )}<br />
      {this.boundSelectField('birth_country', 'Country', this.countryOptions, errors.birth_country)}<br />
      {this.boundDateField('date_of_birth', 'Date of birth', errors.date_of_birth)}<br />

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
