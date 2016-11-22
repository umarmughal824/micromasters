// @flow
import React from 'react';
import _ from 'lodash';
import iso3166 from 'iso-3166-2';
import SelectField from './SelectField';
import type { Profile, UpdateProfileFunc, ValidationErrors } from '../../flow/profileTypes';
import type { Validator, UIValidator } from '../../lib/validation/profile';
import type { Option } from '../../flow/generalTypes';

let countryOptions = _(iso3166.data)
  .map((countryInfoObj, countryCode) => ({
    value: countryCode,
    label: countryInfoObj.name
  }))
  .sortBy('label').value();

export default class CountrySelectField extends React.Component {
  props: {
    className:                  string,
    countryKeySet:              Array<string>,
    errors:                     ValidationErrors,
    keySet:                     Array<string>,
    label:                      string,
    maxSearchResults:           number,
    options:                    Array<Option>,
    profile:                    Profile,
    stateKeySet:                Array<string>,
    topMenu:                    boolean,
    updateProfile:              UpdateProfileFunc,
    updateValidationVisibility: (xs: Array<string>) => void,
    validator:                  Validator|UIValidator,
  };

  onChange: Function = (selection: Option): void => {
    const { stateKeySet, countryKeySet, updateProfile, validator, profile } = this.props;
    // clear state field when country field changes
    let clone = _.cloneDeep(profile);
    _.set(clone, stateKeySet, null);
    _.set(clone, countryKeySet, selection ? selection.value : "");
    updateProfile(clone, validator);
  };

  render() {
    const { countryKeySet } = this.props;
    return <SelectField
      options={countryOptions}
      keySet={countryKeySet}
      onChange={this.onChange}
      {...this.props}
    />;
  }
}
