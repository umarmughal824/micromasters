import React from 'react';
import TextField from 'react-mdl/lib/Textfield';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { browserHistory } from 'react-router';
import moment from 'moment';

// utility functions for pushing changes to profile forms back to the
// redux store.
// this expects that the `updateProfile` and `profile` props are passed
// in to whatever component it is used in.

// bind to this.boundTextField in the constructor of a form component
// to update text fields when editing the profile
export function boundTextField(key, label, error) {
  const { updateProfile, profile } = this.props;
  let onChange = e => {
    let clone = Object.assign({}, profile);
    clone[key] = e.target.value;
    updateProfile(clone);
  };
  return (
    <TextField
      floatingLabel
      label={label}
      value={profile[key]}
      error={error}
      onChange={onChange} />
  );
}

// bind this to this.boundSelectField in the constructor of a form component
// to update select fields
// pass in the name (used as placeholder), key for profile, and the options.
export function boundSelectField(key, label, options, error) {
  const { updateProfile, profile } = this.props;
  let onChange = value => {
    let clone = Object.assign({}, profile);
    clone[key] = value ? value.value : null;
    updateProfile(clone);
  };
  return <div>
    <Select
      options={options}
      value={profile[key]}
      placeholder={label}
      onChange={onChange} />
    <span className="validation-error-text">{error}</span>
  </div>;
}

// bind this to this.boundSelectField in the constructor of a form component
// to update select fields
// pass in the name (used as placeholder), key for profile, and the options.
export function boundDateField(key, label, error) {
  const { updateProfile, profile } = this.props;
  let onChange = date => {
    let clone = Object.assign({}, profile);
    // format as ISO-8601
    clone[key] = date.format("YYYY-MM-DD");
    updateProfile(clone);
  };
  let newDate = profile[key] ? moment(profile[key], "YYYY-MM-DD") : null;
  return <div>
    <DatePicker
      selected={newDate}
      placeholderText={label}
      showYearDropdown
      onChange={onChange}
    />
    <span className="validation-error-text">{error}</span>
  </div>;
}


// bind to this.saveAndContinue.bind(this, '/next/url')
export function saveAndContinue(next) {
  const { saveProfile, profile } = this.props;

  saveProfile(profile).then(() => {
    browserHistory.push(next)
  });
}
