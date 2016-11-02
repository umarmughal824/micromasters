import React from 'react';
import { assert } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import VirtualizedSelect from 'react-virtualized-select';
import R from 'ramda';

import { USER_PROFILE_RESPONSE } from '../../constants';
import iso3166 from 'iso-3166-2';

import SelectField from './SelectField';
import CountrySelectField from './CountrySelectField';
import StateSelectField from './StateSelectField';

describe('Profile inputs', () => {
  let inputProps, sandbox;

  const change = (newProfile) => inputProps.profile = newProfile;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  const renderTestSelectField = () => (
    shallow(<SelectField {...inputProps} />)
  );

  describe('Select field', () => {
    let selectField;

    let genderOptions = [
      {value: 'm', label: 'Male'},
      {value: 'f', label: 'Female'},
      {value: 'o', label: 'Other/Prefer not to say'}
    ];

    let renderGenderSelectField = () => {
      Object.assign(inputProps, {
        keySet: ['gender'],
        label: "Gender",
        options: genderOptions
      });
      return renderTestSelectField();
    };

    beforeEach(() => {
      inputProps = {
        profile: {
          "account_privacy": "private",
          "first_name": "",
          "date_of_birth": "",
          "gender": undefined,
          "date_field": ""
        },
        errors: {
          "first_name": "First name is required",
          "date_of_birth": "Date of birth is required",
          "gender": "Gender is required",
          "date_field": "Date field is required",
          "account_privacy": "Account privacy is required"
        },
        updateProfile: change,
        updateValidationVisibility: sandbox.stub(),
      };
    });

    it('should set props correctly', () => {
      selectField = renderGenderSelectField().find(VirtualizedSelect);
      let props = selectField.props();
      assert.deepEqual(props.options, genderOptions);
      assert.equal(props.label, 'Gender');
    });

    it('should update the selected option when onChange fires with an option', () => {
      selectField = renderGenderSelectField().find(VirtualizedSelect);
      let option = genderOptions[1];
      selectField.props().onChange({
        text: option.label,
        value: option.value
      });
      assert.equal(inputProps.profile.gender, 'f');
    });

    it('should have the correct option selected', () => {
      inputProps.profile.gender = 'f';
      selectField = renderGenderSelectField().find(VirtualizedSelect);
      assert.equal(selectField.props().value, 'f');
    });
  });

  describe("State select field", () => {
    beforeEach(() => {
      inputProps = {
        stateKeySet: ['state_key'],
        countryKeySet: ['country_key'],
        label: 'State',
        profile: Object.assign({}, USER_PROFILE_RESPONSE),
        errors: {},
        updateProfile: change
      };
    });

    const renderStateSelect = () => (
      shallow(<StateSelectField {...inputProps} />)
    );

    it('lists no states when an invalid country is selected', () => {
      inputProps.profile.country_key = 'MISSING';
      let stateField = renderStateSelect();
      assert.lengthOf(stateField.props().options, 0);
    });

    it('renders a select field with sorted states for the given country', () => {
      const country = "US";
      // Get a list of US state values (eg: 'US-MA') ordered by the state name
      let orderedUSStateValues = _(iso3166.data[country].sub).toPairs().sortBy((keyValueList) => {
        return keyValueList[1]['name'];
      }).map((keyValueList) => {
        return keyValueList[0];
      }).value();
      inputProps.profile.country_key = country;
      let stateField = renderStateSelect();
      let optionValueList = stateField.props().options.map((option) => {
        return option.value;
      });
      assert.deepEqual(optionValueList, orderedUSStateValues);
    });
  });

  describe("Country select field", () => {
    beforeEach(() => {
      inputProps = {
        stateKeySet: ['state_key'],
        countryKeySet: ['country_key'],
        label: 'Country',
        profile: Object.assign({}, USER_PROFILE_RESPONSE),
        errors: {},
        updateProfile: change
      };
    });

    const renderCountrySelect = () => (
      shallow(<CountrySelectField {...inputProps} />)
    );

    it('shows a list of countries', () => {
      inputProps.profile.country_key = null;
      inputProps.profile.country = null;
      let countryField = renderCountrySelect();
      let props = countryField.props();
      assert.lengthOf(props.options, _.keys(iso3166.data).length);
      // Check for a random list of country values that should exist as options in the select field
      let countriesToFind = ['AF', 'AL', 'US', 'IN', 'NZ'];
      let countriesInCommon = R.intersection(R.map(R.prop('value'), props.options), countriesToFind);
      assert.equal(countriesInCommon.length, countriesToFind.length);
    });

    it('clears the state state when the country changes', () => {
      inputProps.profile.country_key = 'US';
      inputProps.profile.state_key = 'US-MA';
      let countryField = renderCountrySelect();
      countryField.props().onChange({ value: 'AL' });
      assert.equal(inputProps.profile.country_key, 'AL');
      assert.equal(inputProps.profile.state_key, null);
    });
  });
});
