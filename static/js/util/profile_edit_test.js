import assert from 'assert';
import moment from 'moment';

import {
  boundTextField,
  boundDateField,
  boundSelectField
} from './profile_edit';

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
        },
        errors: {
          "first_name": "First name is required",
          "date_of_birth": "Date of birth is required",
          "gender": "Gender is required",
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
      assert.deepEqual(cur.format('YYYY-MM-DD'), that.props.profile.date_of_birth);
    });
  });

  describe('Bound select field', () => {
    let selectField, selectElement, errorText;
    let genderOptions = [
      { value: 'm', label: 'Male' },
      { value: 'f', label: 'Female' },
      { value: 'o', label: 'Other/Prefer not to say' }
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
});
