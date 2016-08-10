// @flow
import React from 'react';

import ProfileProgressControls from './ProfileProgressControls';
import EducationForm from './EducationForm';
import {
  educationUiValidation,
  educationValidation,
  combineValidators,
} from '../util/validation';
import type { Profile, SaveProfileFunc } from '../flow/profileTypes';
import type { UIState } from '../reducers/ui';

class EducationTab extends React.Component {
  props: {
    nextStep:     () => void,
    prevStep:     () => void,
    profile:      Profile,
    ui:           UIState,
    saveProfile:  SaveProfileFunc,
  };

  render() {
    let validator = combineValidators(educationValidation, educationUiValidation);
    return (
      <div>
        <EducationForm {...this.props} validator={validator} />
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

export default EducationTab;
