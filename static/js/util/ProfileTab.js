import React from 'react';

import {
  boundDateField,
  boundTextField,
  boundSelectField,
} from './profile_edit';
import COUNTRIES from '../countries';

class ProfileTab extends React.Component {
  constructor(props) {
    super(props);
    this.boundTextField = boundTextField.bind(this);
    this.boundSelectField = boundSelectField.bind(this);
    this.boundDateField = boundDateField.bind(this);
    this.countryOptions = COUNTRIES.map(country => ({
      value: country.Code,
      label: country.Name
    }));
  }
}

export default ProfileTab;
