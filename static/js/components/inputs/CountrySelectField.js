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
    updateProfile:              UpdateProfileFunc,
    stateKeySet:                Array<string>,
    countryKeySet:              Array<string>,
    errors:                     ValidationErrors,
    label:                      Node,
    maxSearchResults:           number,
    keySet:                     Array<string>,
    options:                    Array<Option>,
    validator:                  Validator|UIValidator,
    profile:                    Profile,
    updateValidationVisibility: (xs: Array<string>) => void,
  };

  onChange: Function = (newProfile: Profile): void => {
    const { stateKeySet, updateProfile, validator } = this.props;
    // clear state field when country field changes
    let clone = _.cloneDeep(newProfile);
    _.set(clone, stateKeySet, null);
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
