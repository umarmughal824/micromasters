// @flow
import React from 'react';

import EmploymentForm from './EmploymentForm';
import ProfileProgressControls from './ProfileProgressControls';
import {
  employmentValidation,
  employmentUiValidation,
  combineValidators,
} from '../util/validation';
import type { Profile, SaveProfileFunc } from '../flow/profileTypes';
import type { UIState } from '../reducers/ui';

class EmploymentTab extends React.Component {
  props: {
    saveProfile:  SaveProfileFunc,
    profile:      Profile,
    ui:           UIState,
    nextStep:     () => void,
    prevStep:     () => void,
  };

  render () {
    const validator = combineValidators(employmentValidation, employmentUiValidation);
    return (
      <div>
        <EmploymentForm {...this.props} showSwitch={true} validator={validator} />
        <ProfileProgressControls
          {...this.props}
          nextBtnLabel="Next"
          isLastTab={false}
          validator={validator}
        />
      </div>
    );
  }
}

export default EmploymentTab;
