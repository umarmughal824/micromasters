/* global SETTINGS */
import React from 'react';
import { connect } from 'react-redux';
import Tabs from 'react-mdl/lib/Tabs/Tabs';
import Tab from 'react-mdl/lib/Tabs/Tab';

import {
  startProfileEdit,
  updateProfile,
  clearProfileEdit,
  saveProfile,
} from '../actions';
import PersonalTab from '../components/PersonalTab';

class ProfilePage extends React.Component {
  updateProfile(profile) {
    const { dispatch } = this.props;
    if (profile.edit === undefined) {
      dispatch(startProfileEdit());
    }
    dispatch(updateProfile(profile));
  }

  saveProfile(profile) {
    const { dispatch } = this.props;
    return dispatch(saveProfile(SETTINGS.username, profile)).then(() => {
      dispatch(clearProfileEdit());
    });
  }

  render() {
    let { profile } = this.props;

    if (profile.edit !== undefined && profile.edit.profile !== undefined) {
      profile = profile.edit.profile;
    } else {
      profile = profile.profile;
    }

    return <div className="card">
      <div className="card-copy">
        <h1>Enroll in MIT Micromasters</h1>
        <p>
          Please tell us more about yourself so you can participate in the
          micromasters community and qualify for your micromasters certificate.
        </p>
        <Tabs activeTab={0}>
          <Tab>Personal</Tab>
          <Tab className="no-hover">Education</Tab>
          <Tab className="no-hover">Professional</Tab>
        </Tabs>
        <section>
          <PersonalTab
            profile={profile}
            updateProfile={this.updateProfile.bind(this)}
            saveProfile={this.saveProfile.bind(this)}
          />
        </section>
      </div>
    </div>;
  }
}

ProfilePage.propTypes = {
  profile:    React.PropTypes.object.isRequired,
  dispatch:   React.PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  profile: state.userProfile
});

export default connect(mapStateToProps)(ProfilePage);
