/* global SETTINGS: false */
import React from 'react';
import { connect } from 'react-redux';
import Loader from 'react-loader';

import { FETCH_PROCESSING, clearProfile } from '../actions';
import ProfileFormContainer from './ProfileFormContainer';

class UserPage extends ProfileFormContainer {
  componentDidMount() {
    this.fetchProfile();
  }

  componentDidUpdate() {
    this.fetchProfile();
  }

  componentWillUnmount() {
    const { dispatch, params: { username } } = this.props;
    if (SETTINGS.username !== username) {
      // don't erase the user's own profile from the state
      dispatch(clearProfile(username));
    }
  }

  render() {
    const { params: { username }, profiles } = this.props;

    let profile = {};
    let loaded = false;
    if (profiles[username] !== undefined) {
      profile = profiles[username];
      loaded = profiles[username].getStatus !== FETCH_PROCESSING;
    }

    let childrenWithProps = this.childrenWithProps(profile);
    return <Loader loaded={loaded}>
      { childrenWithProps }
    </Loader>;
  }
}

export default connect(ProfileFormContainer.mapStateToProps)(UserPage);
