// @flow
/* global SETTINGS: false */
import React from 'react';

import { makeProfileImageUrl, getPreferredName } from '../util/util';
import type { Profile } from '../flow/profileTypes';

export default class ProfileImage extends React.Component {
  props: {
    profile: Profile
  };

  render () {
    const { profile } = this.props;
    const imageUrl = makeProfileImageUrl(profile);
    return (
      <img
        src={imageUrl}
        alt={`Profile image for ${getPreferredName(profile, false)}`}
        className="card-image"
      />
    );
  }
}
