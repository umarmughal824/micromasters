import React from 'react';
import TextField from 'react-mdl/lib/Textfield';
import Button from 'react-mdl/lib/Button';
import Select from 'react-select';

import { LANGUAGE_CODES } from '../language_codes';

class PersonalTab extends React.Component {
  boundTextField(name, label) {
    const { updateProfile, profile } = this.props;
    let onChange = e => {
      let clone = Object.assign({}, profile);
      clone[name] = e.target.value;
      updateProfile(clone);
    };
    return <TextField
      floatingLabel
      label={label}
      value={profile[name]}
      onChange={onChange}
    />;
  }

  updateGender(gender) {
    const { updateProfile, profile } = this.props;
    let clone = Object.assign({}, profile, {
      gender: gender ? gender.value : null
    });
    updateProfile(clone);
  }

  updateLanguage(language) {
    const { updateProfile, profile } = this.props;
    let clone = Object.assign({}, profile, {
      'preferred_language': language ? language.value : null
    });
    updateProfile(clone);
  }

  saveAndContinue() {
    const { saveProfile, profile } = this.props;

    saveProfile(profile).then(() => {
      // TODO: update to next tab
    });
  }

  render() {
    const { profile } = this.props;

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
        value={profile.gender}
        onChange={this.updateGender.bind(this)}
        placeholder="Gender"
      /><br />

      <Select
        options={languages}
        value={profile.preferred_language}
        onChange={this.updateLanguage.bind(this)}
        placeholder="Preferred language"
      /><br />

      <Button raised onClick={this.saveAndContinue.bind(this)}>
        Save and continue
      </Button>
    </div>;
  }
}

PersonalTab.propTypes = {
  profile: React.PropTypes.object.isRequired,
  saveProfile: React.PropTypes.func.isRequired,
  updateProfile: React.PropTypes.func.isRequired,
};

export default PersonalTab;
