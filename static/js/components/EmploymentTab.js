import React from 'react';
import Grid, { Cell } from 'react-mdl/lib/Grid';

import EmploymentForm from './EmploymentForm';
import ProfileFormFields from '../util/ProfileFormFields';

class EmploymentTab extends ProfileFormFields {
  prevUrl = "/profile/education";
  nextUrl = "/profile/privacy";

  render () {
    return (
      <div>
        <Grid className="profile-splash">
          <Cell col={12}>
            Tell us about your employment.
          </Cell>
        </Grid>
        <Grid className="profile-tab-grid">
          <Cell col={1}></Cell>
          <Cell col={10}>
            <EmploymentForm {...this.props} />
          </Cell>
          <Cell col={1}></Cell>
          <Cell col={1}></Cell>
          <Cell col={10}>
            {this.progressControls()}
          </Cell>
          <Cell col={1}></Cell>
        </Grid>
      </div>
    );
  }
}

export default EmploymentTab;
