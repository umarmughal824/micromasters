// @flow
import React from 'react';
import { Card, CardTitle } from 'react-mdl/lib/Card';
import IconButton from 'react-mdl/lib/IconButton';
import _ from 'lodash';

import type { Profile } from '../../flow/profileTypes';
import type { Program } from '../../flow/programTypes';
import {
  PEARSON_PROFILE_ABSENT,
  PEARSON_PROFILE_SUCCESS,
  PEARSON_PROFILE_IN_PROGRESS,
  PEARSON_PROFILE_INVALID,
  PEARSON_PROFILE_SCHEDULABLE
} from '../../constants';
import { getPreferredName, getLocation } from '../../util/util';

const cardWrapper = children => (
  <Card shadow={0} className="final-exam-card">
    <div className="card-header">
      <div>
        <img className="exam-icon" src="/static/images/exam_icon.png" />
      </div>
      <div>
        <CardTitle>
          Final Exams
        </CardTitle>
        <p>
          {`You must take a proctored exam for each course. Exams may be taken
            at any `}
          <a href="">
            Pearson test center
          </a>
          {`. Before you can take an exam, you have to pay for the course and
          pass the online work.`}
        </p>
      </div>
    </div>
    {children}
  </Card>
);

const getPostalCode = profile => (
  profile.postal_code !== null ? <span>{ profile.postal_code }</span> : null
);


const accountCreated = (profile, navigateToProfile) => (
  <div>
    <div className="info-box split">
      <div className="flow"> 
        Your Pearson Testing account has been created. Your information
        should match the ID you bring to the test center.
      </div>
      <div className="address-info">
        <div className="address">
          <span className="name">
            { getPreferredName(profile) }
          </span>
          <span>
            { _.get(profile, ['address']) }
          </span>
          <span>
            { getLocation(profile) }
          </span>
          { getPostalCode(profile) }
          <span>
            Phone: { _.get(profile, ['phone_number']) }
          </span>
        </div>
        { editProfileButton(navigateToProfile) }
      </div>
    </div>
    <div className="currently-ineligible">
      We will notify you when you become eligible to schedule course exams.
    </div>
  </div>
);

const editProfileButton = fn => (
  <IconButton name="edit" onClick={fn} />
);

const absentCard = () => cardWrapper(
  <p>
    We will notify you when you become eligible to schedule course exams.
  </p>
);

const successCard = (profile, navigateToProfile) => cardWrapper(
  accountCreated(profile, navigateToProfile)
);


const pendingCard = () => cardWrapper(
  <div className="info-box">
    Your updated information has been submitted to Pearson. Please check back later.
  </div>
);

const invalidCard = navigateToProfile => cardWrapper(
  <div className="info-box">
    { editProfileButton(navigateToProfile) }
    <div>
      You need to
      {" "}
      <a onClick={navigateToProfile}>
        update your profile
      </a>
      {" "}
      in order to take a test at a Pearson Test center.
    </div>
  </div>
);

const schedulableCard = (profile, navigateToProfile) => cardWrapper(
  accountCreated(profile, navigateToProfile)
);

type Props = {
  profile:            Profile,
  program:            Program,
  navigateToProfile:  () => void,
};

export default class FinalExamCard extends React.Component<void, Props, void> {
  render () {
    const {
      profile,
      program,
      navigateToProfile
    } = this.props;

    switch (program.pearson_exam_status) {
    case PEARSON_PROFILE_ABSENT:
      return absentCard();
    case PEARSON_PROFILE_SUCCESS:
      return successCard(profile, navigateToProfile);
    case PEARSON_PROFILE_IN_PROGRESS:
      return pendingCard();
    case PEARSON_PROFILE_INVALID:
      return invalidCard(navigateToProfile);
    case PEARSON_PROFILE_SCHEDULABLE:
      return schedulableCard(profile, navigateToProfile);
    default:
      return null;
    }
  }
}
