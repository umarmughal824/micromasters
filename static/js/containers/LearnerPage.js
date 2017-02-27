// @flow
/* global SETTINGS: false */
import React from 'react';
import { connect } from 'react-redux';
import Loader from '../components/Loader';
import R from 'ramda';

import { FETCH_PROCESSING } from '../actions';
import { clearProfile } from '../actions/profile';
import {
  profileFormContainer,
  mapStateToProfileProps,
  childrenWithProps,
} from './ProfileFormContainer';
import ErrorMessage from '../components/ErrorMessage';
import type { ProfileContainerProps } from './ProfileFormContainer';

class LearnerPage extends React.Component<*, ProfileContainerProps, *> {
  componentDidMount() {
    const { params: { username }, fetchProfile } = this.props;
    fetchProfile(username);
  }

  componentDidUpdate() {
    const { params: { username }, fetchProfile } = this.props;
    fetchProfile(username);
  }

  componentWillUnmount() {
    const { dispatch, params: { username } } = this.props;
    if (SETTINGS.user.username !== username) {
      // don't erase the user's own profile from the state
      dispatch(clearProfile(username));
    }
  }

  render() {
    const {
      params: { username },
      profiles,
      children,
      profileProps,
    } = this.props;

    let profile = {};
    let toRender = null;
    let loaded = false;
    if (profiles[username] !== undefined) {
      profile = profiles[username];
      loaded = profiles[username].getStatus !== FETCH_PROCESSING;
      toRender = childrenWithProps(children, profileProps(profile));
    }
    const { errorInfo } = profile;
    return <Loader loaded={loaded}>
      {errorInfo && loaded ? <ErrorMessage errorInfo={errorInfo} /> : toRender }
    </Loader>;
  }
}

export default R.compose(
  connect(mapStateToProfileProps),
  profileFormContainer
)(LearnerPage);
