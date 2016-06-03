import React from 'react';
import Grid, { Cell } from 'react-mdl/lib/Grid';

import ProfileFormFields from '../util/ProfileFormFields';

class PersonalTab extends ProfileFormFields {
  nextUrl = "/profile/education";

  static propTypes = {
    profile:        React.PropTypes.object,
    errors:         React.PropTypes.object,
    saveProfile:    React.PropTypes.func,
    updateProfile:  React.PropTypes.func,
  };

  render() {
    return <div>
      <Grid className="profile-splash">
        <Cell col={12}>
          Please tell us more about yourself so you can participate in the MicroMaster’s
          community and qualify for your MicroMaster’s credential.
        </Cell>
      </Grid>
      <Grid className="profile-tab-grid">
        <Cell col={1} />
        <Cell col={10}>
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
        </Cell>
        <Cell col={1} />
        <Cell col={1} />
        <Cell col={10}>
          {this.progressControls()}
        </Cell>
        <Cell col={1} />
      </Grid>
    </div>;
  }
}

export default PersonalTab;
