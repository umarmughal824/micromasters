import React from 'react';
import Grid, { Cell } from 'react-mdl/lib/Grid';

import ProfileFormFields from '../util/ProfileFormFields';

export default class PersonalForm extends ProfileFormFields {
  static propTypes = {
    profile:        React.PropTypes.object,
    errors:         React.PropTypes.object,
    saveProfile:    React.PropTypes.func,
    updateProfile:  React.PropTypes.func,
  };

  render() {
    return (
      <Grid className="profile-tab-card-grid">
        <Cell col={6}>
          {this.boundTextField(["first_name"], "Given name")}
        </Cell>
        <Cell col={6}>
          {this.boundTextField(["last_name"], "Family name")}
        </Cell>
        <Cell col={12}>
          {this.boundTextField(["preferred_name"], "Preferred name")}
        </Cell>
        <Cell col={12}>
          {this.boundDateField(['date_of_birth'], 'Date of birth')}
        </Cell>
        <Cell col={12} className="profile-gender-group">
          {this.boundRadioGroupField(['gender'], 'Gender', this.genderOptions)}
        </Cell>
        <Cell col={12}>
          {this.boundSelectField(
            ['preferred_language'],
            'Preferred language',
            this.languageOptions
          )}
        </Cell>
        <Cell col={12}>
          <h4>Currently Living</h4>
        </Cell>
        <Cell col={4}>
          {this.boundCountrySelectField(['state_or_territory'], ['country'], 'Country')}
        </Cell>
        <Cell col={4}>
          {this.boundStateSelectField(['state_or_territory'], ['country'], 'State or Territory')}
        </Cell>
        <Cell col={4}>
          {this.boundTextField(['city'], 'City')}
        </Cell>
        <Cell col={12}>
          <h4>Where were you born?</h4>
        </Cell>
        <Cell col={4}>
          {this.boundCountrySelectField(
            ['birth_state_or_territory'],
            ['birth_country'],
            'Country'
          )}</Cell>
        <Cell col={4}>
          {this.boundStateSelectField(['birth_state_or_territory'], ['birth_country'], 'State or Territory')}
        </Cell>
        <Cell col={4}>
          {this.boundTextField(['birth_city'], 'City')}
        </Cell>
      </Grid>
    );
  }
}
