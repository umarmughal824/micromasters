// @flow
import React from 'react';
import { Card } from 'react-mdl/lib/Card';
import Icon from 'react-mdl/lib/Icon';

import { getPreferredName, getEmployer } from '../util/util';
import ProfileImage from '../containers/ProfileImage';
import { mstr } from '../lib/sanctuary';
import type { Profile } from '../flow/profileTypes';

type LearnerChipProps = {
  profile: Profile,
  hasPayment: boolean,
  openLearnerEmailComposer: () => void
};

const LearnerChip = (props: LearnerChipProps): React$Element<*> => {
  const { profile, openLearnerEmailComposer, hasPayment } = props;

  let emailLink;
  if (profile.email_optin && hasPayment) {
    emailLink = (
      <button onClick={openLearnerEmailComposer} className="icon-button-link">
        <Icon name="email" aria-hidden="true" />
        <span>Send a Message</span>
      </button>
    );
  }

  return <Card className="user-chip">
    <div className="profile-info">
      <span className="name">
        { getPreferredName(profile) }
      </span>
      <span className="employer">
        { mstr(getEmployer(profile)) }
      </span>
      <a href={`/learner/${profile.username}`} className="icon-button-link">
        <Icon name="person" aria-hidden="true" />
        <span>View Profile</span>
      </a>
      { emailLink }
    </div>
    <ProfileImage profile={profile}/>
  </Card>;
};

export default LearnerChip;
