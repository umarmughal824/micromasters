// @flow
/* global SETTINGS */
import React from 'react';
import { connect } from 'react-redux';

import { getPreferredName } from '../util/util';
import Jumbotron from '../components/Jumbotron';
import { makeProfileProgressDisplay } from '../util/util';
import ProfileFormContainer from './ProfileFormContainer';
import PersonalTab from '../components/PersonalTab';
import EmploymentTab from '../components/EmploymentTab';
import PrivacyTab from '../components/PrivacyTab';
import EducationTab from '../components/EducationTab';
import {
  PERSONAL_STEP,
  EDUCATION_STEP,
  EMPLOYMENT_STEP,
  PRIVACY_STEP
} from '../constants';

class ProfilePage extends ProfileFormContainer {
  currentStep: Function = (): string => {
    const { ui: { profileStep } } = this.props;
    return profileStep;
  }

  stepTransitions: Function = (): [void|() => void, () => void] => {
    let setStep = step => () => this.setProfileStep(step);
    switch ( this.currentStep() ) {
    case EDUCATION_STEP:
      return [setStep(PERSONAL_STEP), setStep(EMPLOYMENT_STEP)];
    case EMPLOYMENT_STEP:
      return [setStep(EDUCATION_STEP), setStep(PRIVACY_STEP)];
    case PRIVACY_STEP:
      return [
        setStep(EMPLOYMENT_STEP),
        () => this.context.router.push('/dashboard')
      ];
    default:
      return [undefined, setStep(EDUCATION_STEP)];
    }
  };

  currentComponent: Function = (props): React$Element => {
    switch ( this.currentStep() ) {
    case EDUCATION_STEP:
      return <EducationTab {...props} />;
    case EMPLOYMENT_STEP:
      return <EmploymentTab {...props} />;
    case PRIVACY_STEP:
      return <PrivacyTab {...props} />;
    default:
      return <PersonalTab {...props} />;
    }
  };

  render() {
    const { profiles } = this.props;
    let props, text, profile;
    let [prev, next] = this.stepTransitions();
    props = Object.assign({}, this.profileProps(profiles[SETTINGS.username]), {
      prevStep: prev,
      nextStep: next
    });
    profile = props.profile;
    text = `Welcome ${getPreferredName(profile)}, let's
      complete your enrollment to MIT MicroMasters.`;

    return <div className="card">
      <Jumbotron profile={profile} text={text}>
        <div className="card-copy">
          <div style={{textAlign: "center"}}>
            {makeProfileProgressDisplay(this.currentStep())}
          </div>
          <section>
            {this.currentComponent(props)}
          </section>
        </div>
      </Jumbotron>
    </div>;
  }
}

export default connect(ProfileFormContainer.mapStateToProps)(ProfilePage);
