import React from 'react';
import TextField from 'react-mdl/lib/Textfield';
import Card from 'react-mdl/lib/Card';
import Select from 'react-select';

import { updateProfile } from '../actions';
import { LANGUAGE_CODES } from '../language_codes';

class PersonalTab extends React.Component {
  boundTextField(name, label) {
    const { dispatch, profile: { profileCopy } } = this.props;
    let onChange = e => {
      let clone = Object.assign({}, profileCopy);
      clone[name] = e.target.value;
      dispatch(updateProfile(clone));
    };
    return <TextField
      floatingLabel
      label={label}
      value={profileCopy[name]}
      onChange={onChange}
    />;
  };

  updateGender(gender) {
    const { dispatch, profile: { profileCopy } } = this.props;
    let clone = Object.assign({}, profileCopy, {
      gender: gender
    });
    dispatch(updateProfile(clone));
  }

  updateLanguage(language) {
    const { dispatch, profile: { profileCopy } } = this.props;
    let clone = Object.assign({}, profileCopy, {
      'preferred_language': language
    });
    dispatch(updateProfile(clone));
  }

  render() {
    const { profile: { profileCopy } } = this.props;

    let languages = LANGUAGE_CODES.map(language => ({
      value: language.alpha2,
      label: language.English
    }));

    let boundTextField = this.boundTextField.bind(this);
    return <div>
      {boundTextField("first_name", "Given name")}<br />
      {boundTextField("last_name", "Family name")}<br />
      {boundTextField("preferred_name", "Preferred name (optional)")}<br />
      <Select
        options={[
          { value: 'm', label: 'Male' },
          { value: 'f', label: 'Female' },
          { value: 'o', label: 'Other/Prefer not to say' }
        ]}
        value={profileCopy.gender}
        onChange={this.updateGender.bind(this)}
        placeholder="Gender"
      /><br />

      <Select
        options={languages}
        value={profileCopy.preferred_language}
        onChange={this.updateLanguage.bind(this)}
        placeholder="Preferred language"
      /><br />

    </div>;
  }
}

PersonalTab.propTypes = {
  profile: React.PropTypes.object.isRequired,
  dispatch: React.PropTypes.func.isRequired
};

export default PersonalTab;
