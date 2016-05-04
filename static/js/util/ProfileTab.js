import React from 'react';

import {
  boundDateField,
  boundTextField,
  boundSelectField,
  editProfileObjectArray,
} from './profile_edit';
import COUNTRIES from '../countries';
import LANGUAGE_CODES from '../language_codes';

class ProfileTab extends React.Component {
  constructor(props) {
    super(props);

    // bind our field methods to this
    this.boundTextField = boundTextField.bind(this);
    this.boundSelectField = boundSelectField.bind(this);
    this.boundDateField = boundDateField.bind(this);
    this.editProfileObjectArray = editProfileObjectArray.bind(this);

    // options we set (for select components)
    this.countryOptions = COUNTRIES.map(country => ({
      value: country.Code,
      label: country.Name
    }));
    this.boolOptions = [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ];
    this.genderOptions = [
      { value: 'm', label: 'Male' },
      { value: 'f', label: 'Female' },
      { value: 'o', label: 'Other/Prefer not to say' }
    ];
    this.languageOptions = LANGUAGE_CODES.map(language => ({
      value: language.alpha2,
      label: language.English
    }));
  }

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };
}

export default ProfileTab;
