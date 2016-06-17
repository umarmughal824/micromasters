// @flow
import React from 'react';
import _ from 'lodash';
import iso3166 from 'iso-3166-2';
import SelectField from './SelectField';
import type { Profile } from '../../flow/profileTypes';

let countryOptions = _(iso3166.data)
  .map((countryInfoObj, countryCode) => ({
    value: countryCode,
    label: countryInfoObj.name
  }))
  .sortBy('label').value();

export default class CountrySelectField extends React.Component {
  static propTypes = {
    updateProfile:            React.PropTypes.func,
    stateKeySet:              React.PropTypes.array,
    countryKeySet:            React.PropTypes.array
  };

  onChange: Function = (newProfile: Profile): void => {
    const { stateKeySet, updateProfile } = this.props;
    // clear state field when country field changes
    let clone = _.cloneDeep(newProfile);
    _.set(clone, stateKeySet, null);
    updateProfile(clone);
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
