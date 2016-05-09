import assert from 'assert';
import TestUtils from 'react-addons-test-utils';
import iso3166 from 'iso-3166-2';
import _ from 'lodash';

import { boundStateSelectField } from '../util/profile_edit';
import { USER_PROFILE_RESPONSE } from '../constants';
import moment from 'moment';

import {
  boundTextField,
  boundDateField,
  boundSelectField,
  boundMonthField,
  boundYearField
} from './profile_edit';
import { DATE_FORMAT } from '../constants';

describe('Profile Editing utility functions', () => {
  let that;
  const change = (clone) => that.props.profile = clone;
  beforeEach(() => {
    that = {
      props: {
        profile: {
          "first_name": "",
          "date_of_birth": "",
          "gender": undefined,
          "date_field": ""
        },
        errors: {
          "first_name": "First name is required",
          "date_of_birth": "Date of birth is required",
          "gender": "Gender is required",
          "date_field": "Date field is required"
        },
        updateProfile: change
      }
    };
  });

  describe('Bound Text field', () => {
    let textField;
    beforeEach(() => {
      textField = boundTextField.call(
        that,
        ["first_name"],
        "First Name"
      );
    });

    it('should correctly set props on itself', () => {
      assert.deepEqual('First Name', textField.props.label);
      assert.deepEqual('First name is required', textField.props.error);
      assert.deepEqual('', textField.props.value);
      assert.deepEqual(true, textField.props.floatingLabel);
    });

    it('should call the updateProfile callback when onChange fires', () => {
      textField.props.onChange({target: {value: "foo"}});
      assert.deepEqual("foo", that.props.profile.first_name);
    });

    it('should use an empty string instead of undefined for the value prop', () => {
      let blankTextField = boundTextField.call(that, ["missing"], "Missing");
      assert.equal('', blankTextField.props.value);
    });
  });

  describe('Bound Date field', () => {
    let dateField, dateElement, errorText;
    beforeEach(() => {
      dateField = boundDateField.call(
        that,
        ["date_of_birth"],
        "Date of birth"
      );
      dateElement = dateField.props.children[0];
      errorText = dateField.props.children[1];
    });

    it('should correctly set props on itself', () => {
      assert.equal('Date of birth', dateElement.props.placeholderText);
      assert.equal(errorText.type, 'span');
      assert.deepEqual({
        className: 'validation-error-text',
        children: "Date of birth is required",
      }, errorText.props);
    });

    it('should call the updateProfile callback when onChange fires', () => {
      let cur = moment();
      dateElement.props.onChange(cur);
      assert.deepEqual(cur.format(DATE_FORMAT), that.props.profile.date_of_birth);
    });
  });

  describe('Bound Month field', () => {
    let dateField, selectElement, errorText;
    const monthOptions = [
      {value: 0, label: 'January'},
      {value: 1, label: 'February'},
      {value: 2, label: 'March'},
      {value: 3, label: 'April'},
      {value: 4, label: 'May'},
      {value: 5, label: 'June'},
      {value: 6, label: 'July'},
      {value: 7, label: 'August'},
      {value: 8, label: 'September'},
      {value: 9, label: 'October'},
      {value: 10, label: 'November'},
      {value: 11, label: 'December'}
    ];
    beforeEach(() => {
      dateField = boundMonthField.call(
        that,
        ["date_field"],
        "Month"
      );
      selectElement = dateField.props.children[0];
      errorText = dateField.props.children[1];
    });

    it('should correctly set props on itself', () => {
      assert.equal('Month', selectElement.props.placeholder);
      assert.equal(errorText.type, 'span');
      assert.deepEqual({
        className: 'validation-error-text',
        children: "Date field is required",
      }, errorText.props);
    });

    it('should call the updateProfile callback when onChange fires', () => {
      let cur = moment().set('date', 1);
      selectElement.props.onChange(monthOptions[cur.month()]);
      assert.deepEqual(cur.format(DATE_FORMAT), that.props.profile.date_field);
    });
  });
  describe('Bound Year field', () => {
    let textField, textElement, errorText;
    beforeEach(() => {
      textField = boundYearField.call(
        that,
        ["date_field"],
        "Year"
      );
      [textElement, errorText] = textField.props.children;
    });

    it('should correctly set props on itself', () => {
      assert.deepEqual('Year', textElement.props.label);
      assert.deepEqual({
        className: 'validation-error-text',
        children: "Date field is required"
      }, errorText.props);
      assert.deepEqual('', textElement.props.value);
    });

    it('should call the updateProfile callback when onChange fires', () => {
      let cur = moment().set('date', 1).set('year', 1995);
      textElement.props.onChange({target: {value: cur.year()}});
      assert.deepEqual(cur.format(DATE_FORMAT), that.props.profile.date_field);
    });
  });

  describe('Bound select field', () => {
    let selectField, selectElement, errorText;
    let genderOptions = [
      {value: 'm', label: 'Male'},
      {value: 'f', label: 'Female'},
      {value: 'o', label: 'Other/Prefer not to say'}
    ];

    beforeEach(() => {
      selectField = boundSelectField.call(
        that,
        ['gender'],
        "Gender",
        genderOptions
      );
      selectElement = selectField.props.children[0];
      errorText = selectField.props.children[1];
    });

    it('should set props correctly', () => {
      assert.deepEqual(selectElement.props.options, genderOptions);
      assert.equal(selectElement.props.placeholder, 'Gender');
      assert.equal(selectElement.props.value, undefined);
      assert.deepEqual({
        className: 'validation-error-text',
        children: "Gender is required",
      }, errorText.props);
    });

    it('should call the updateProfile callback when onChange fires', () => {
      selectElement.props.onChange(genderOptions[1]);
      assert.equal(that.props.profile.gender, 'f');
    });
  });

  describe("Bound state select field", () => {
    it('lists no states when an invalid country is selected', () => {
      const country = "MISSING";
      const state = "MISSING";
      let profile = Object.assign({}, USER_PROFILE_RESPONSE, {
        country_key: country,
        state_key: state
      });

      let stateSelectField = boundStateSelectField.bind({
        props: {
          profile,
          updateProfile: () => null
        }
      });

      let result = stateSelectField(["state_key"], ["country_key"], "");
      let select;
      for (let child of result.props.children) {
        if (child.type.displayName === 'Select') {
          select = child;
        }
      }

      assert.equal(select.props.value, state);
      assert.deepEqual(select.props.options, []);
    });

    it('renders a select field with sorted states for the given country', () => {
      const country = "US";
      const state = "US-MA";
      const placeholder = "PLACEHOLDER";
      const error = "ERROR";
      let profile = Object.assign({}, USER_PROFILE_RESPONSE, {
        country_key: country,
        state_key: state
      });

      let stateSelectField = boundStateSelectField.bind({
        props: {
          profile,
          errors: {
            state_key: error
          },
          updateProfile: () => null
        }
      });

      let result = stateSelectField(["state_key"], ["country_key"], placeholder);
      let select, errorSpan;
      for (let child of result.props.children) {
        if (child.type.displayName === 'Select') {
          select = child;
        }
        if (child.props.className === 'validation-error-text') {
          errorSpan = child;
        }
      }

      assert.equal(TestUtils.renderIntoDocument(errorSpan).innerHTML, error);
      assert.equal(select.props.placeholder, placeholder);
      assert.equal(select.props.value, state);

      let options = Object.keys(iso3166.data[country].sub).map(code => ({
        value: code,
        label: iso3166.data[country].sub[code].name
      }));
      options = _.sortBy(options, 'label');
      assert.deepEqual(select.props.options, options);
    });

    it('updates the state properly', () => {
      const country = "US";
      let profile = Object.assign({}, USER_PROFILE_RESPONSE, {
        state_collection: [
          {
            country: "US"
          }
        ]
      });

      let stateSelectField = boundStateSelectField.bind({
        props: {
          profile,
          updateProfile: clone => {
            profile = clone;
          }
        }
      });

      let result = stateSelectField(
        ["state_collection", 0, "state"],
        ["state_collection", 0, "country"],
        "",
      );
      let select;
      for (let child of result.props.children) {
        if (child.type.displayName === 'Select') {
          select = child;
        }
      }
      let newStateCode = "US-TN";
      select.props.onChange({value: newStateCode, label: "Tennessee"});
      assert.equal(profile.state_collection[0].country, country);
      assert.equal(profile.state_collection[0].state, newStateCode);
    });
  });
});
