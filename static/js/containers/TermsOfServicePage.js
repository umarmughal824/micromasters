/* global SETTINGS: false */
import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import { connect } from 'react-redux';

import { saveProfile, FETCH_SUCCESS } from '../actions';

class TermsOfServicePage extends React.Component {
  static propTypes = {
    dispatch:     React.PropTypes.func.isRequired,
    userProfile:  React.PropTypes.object.isRequired,
    history:      React.PropTypes.object.isRequired,
  };

  static contextTypes = {
    router:   React.PropTypes.object.isRequired
  };

  handleAgree() {
    const { dispatch, userProfile } = this.props;
    if (userProfile.getStatus !== FETCH_SUCCESS) {
      // wait until we get user profile before user can agree to terms
      return;
    }
    let profile = Object.assign({}, userProfile.profile, {
      agreed_to_terms_of_service: true
    });
    dispatch(saveProfile(SETTINGS.username, profile)).then(() => {
      this.context.router.push("/profile");
    });
  }

  render() {
    return <div>
      <h3>
        MIT Micromasters Terms of Service
      </h3>

      <p>
        Please read through the terms of service. To enroll in MIT Micromasters you
        must agree to the terms of service.
      </p>

      <p>
        Add terms of service here
      </p>

      <Button
        bsStyle="success"
        onClick={this.handleAgree.bind(this)}
      >Agree</Button> <Button bsStyle="danger" href="/logout">Cancel</Button>
    </div>;
  }
}

const mapStateToProps = state => ({
  userProfile: state.userProfile
});

export default connect(mapStateToProps)(TermsOfServicePage);
