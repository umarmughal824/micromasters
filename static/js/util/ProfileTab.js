import React from 'react';

import {
  boundDateField,
  boundTextField,
  boundSelectField,
  editProfileObjectArray,
  boundStateSelectField,
} from './profile_edit';
import LANGUAGE_CODES from '../language_codes';
import iso3166 from 'iso-3166-2';
import _ from 'lodash';


class ProfileTab extends React.Component {
  constructor(props) {
    super(props);

    // bind our field methods to this
    this.boundTextField = boundTextField.bind(this);
    this.boundSelectField = boundSelectField.bind(this);
    this.boundStateSelectField = boundStateSelectField.bind(this);
    this.boundDateField = boundDateField.bind(this);
    this.editProfileObjectArray = editProfileObjectArray.bind(this);

    // options we set (for select components)
    let countryOptions = Object.keys(iso3166.data).map(code => ({
      value: code,
      label: iso3166.data[code]['name']
    }));
    this.countryOptions = _.sortBy(countryOptions, 'label');
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
    this.privacyOptions = [
      { value: 'public', label: 'Public to the world'},
      { value: 'public_to_mm', label: 'Public to other micromasters students'},
      { value: 'private', label: 'Private'}
    ];
  }

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };
}

export default ProfileTab;
