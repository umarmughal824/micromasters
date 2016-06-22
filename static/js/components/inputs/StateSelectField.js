// @flow
import React from 'react';
import _ from 'lodash';
import iso3166 from 'iso-3166-2';
import SelectField from './SelectField';
import type { Option } from '../../flow/generalTypes';

export default class StateSelectField extends React.Component {
  static propTypes = {
    profile:                  React.PropTypes.object,
    updateProfile:            React.PropTypes.func,
    stateKeySet:              React.PropTypes.array,
    countryKeySet:            React.PropTypes.array
  };

  getStateOptions(): Option[] {
    const { profile, countryKeySet } = this.props;
    let options = [];
    let country = _.get(profile, countryKeySet);
    if (iso3166.data[country] !== undefined) {
      options = _(iso3166.data[country].sub)
        .map((stateInfoObj, stateCode) => ({
          value: stateCode,
          label: stateInfoObj.name
        }))
        .sortBy('label').value();
    }
    return options;
  }

  render() {
    const { stateKeySet } = this.props;
    return <SelectField
      options={this.getStateOptions()}
      keySet={stateKeySet}
      {...this.props}
    />;
  }
}
