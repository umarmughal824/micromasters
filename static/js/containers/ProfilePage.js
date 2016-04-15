import React from 'react';
import { connect } from 'react-redux';
import Tabs from 'react-mdl/lib/Tabs/Tabs';
import Tab from 'react-mdl/lib/Tabs/Tab';

import PersonalTab from '../components/PersonalTab';

class ProfilePage extends React.Component {
  render() {
    const { profile, dispatch } = this.props;

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
          <PersonalTab profile={profile} dispatch={dispatch} />
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
