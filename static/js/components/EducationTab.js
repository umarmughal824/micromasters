import React from 'react';
import Grid, { Cell } from 'react-mdl/lib/Grid';

import ProfileFormFields from '../util/ProfileFormFields';
import EducationForm from './EducationForm';

class EducationTab extends ProfileFormFields {
  prevUrl = "/profile/personal";
  nextUrl = "/profile/professional";

  render() {
    return <div>
      <Grid className="profile-splash">
        <Cell col={12}>
          Please tell us more about your educational background.
        </Cell>
      </Grid>
      <Grid className="profile-tab-grid">
        <Cell col={1}></Cell>
        <Cell col={10}>
          <EducationForm {...this.props} />
        </Cell>
        <Cell col={1}></Cell>
        <Cell col={1} />
        <Cell col={10}>
          {this.progressControls()}
        </Cell>
        <Cell col={1} />
      </Grid>
    </div>;
  }
}

export default EducationTab;
