import React from 'react';
import TextField from 'react-mdl/lib/Textfield';
import Select from 'react-select';
import { browserHistory } from 'react-router';

// utility functions for pushing changes to profile forms back to the
// redux store.
// this expects that the `updateProfile` and `profile` props are passed
// in to whatever component it is used in.

// bind to this.boundTextField in the constructor of a form component
// to update text fields when editing the profile
function boundTextField(name, label) {
  const { updateProfile, profile } = this.props;
  let onChange = e => {
    let clone = Object.assign({}, profile);
    clone[name] = e.target.value;
    updateProfile(clone);
  };
  return (
    <TextField
      floatingLabel
      label={label}
      value={profile[name]}
      onChange={onChange} />
  );
}

// bind this to this.boundSelectField in the constructor of a form component
// to update select fields
// pass in the name (used as placeholder), key for profile, and the options.
function boundSelectField(name, options, key) {
  const { updateProfile, profile } = this.props;
  let onChange = value => {
    let clone = Object.assign({}, profile);
    clone[key] = value ? value.value : null;
    updateProfile(clone);
  };
  return (
    <Select
      options={options}
      value={profile[key]}
      placeholder={name}
      onChange={onChange} />
  );
}

// bind to this.saveAndContinue.bind(this, '/next/url')
function  saveAndContinue(next) {
  const { saveProfile, profile } = this.props;

  saveProfile(profile).then(() => {
    browserHistory.push(next)
  });
}


export { boundTextField, boundSelectField, saveAndContinue };
