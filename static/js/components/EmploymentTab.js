import React from 'react';
import Grid, { Cell } from 'react-mdl/lib/Grid';
import Button from 'react-mdl/lib/Button';

import EmploymentForm from './EmploymentForm';
import ProfileFormFields from '../util/ProfileFormFields';

class EmploymentTab extends ProfileFormFields {
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
            <Button
              raised
              colored
              className="profile-save-and-continue"
              onClick={this.saveAndContinue}>
              <span>Save and Continue</span>
            </Button>
          </Cell>
          <Cell col={1}></Cell>
        </Grid>
      </div>
    );
  }
}

export default EmploymentTab;
