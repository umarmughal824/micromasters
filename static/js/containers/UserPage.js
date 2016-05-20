/* global SETTINGS: false */
import React from 'react';
import { connect } from 'react-redux';
import Loader from 'react-loader';

import { FETCH_PROCESSING } from '../actions';
import User from '../components/User';

import {
  fetchUserProfile,
  clearProfile,
} from '../actions';

class UserPage extends React.Component {
  static propTypes = {
    dispatch: React.PropTypes.func.isRequired,
    profiles: React.PropTypes.object.isRequired,
    params: React.PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.fetchProfile();
  }

  componentDidUpdate() {
    this.fetchProfile();
  }

  fetchProfile = () => {
    const { dispatch, profiles, params: { username } } = this.props;
    if (profiles[username] === undefined || profiles[username].getStatus === undefined) {
      dispatch(fetchUserProfile(username));
    }
  };

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
      profile = profiles[username].profile;
      loaded = profiles[username].getStatus !== FETCH_PROCESSING;
    }

    return <Loader loaded={loaded}>
      <User profile={profile} />
    </Loader>;
  }
}

const mapStateToProps = state => ({
  profiles: state.profiles
});

export default connect(mapStateToProps)(UserPage);
