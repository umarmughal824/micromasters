/* global SETTINGS: false */
import React from 'react';
import { connect } from 'react-redux';
import SplitButton from 'react-bootstrap/lib/SplitButton';
import LinkContainer from 'react-router-bootstrap/lib/LinkContainer';
import MenuItem from 'react-bootstrap/lib/MenuItem';

class LoginButton extends React.Component {
  render() {
    const { profile } = this.props;

    // span tags are a workaround for weird indentation with react-bootstrap
    // and React 15. React 15 removed span tags but react-bootstrap still expects
    // them.
    let title = <span>
      {profile.preferred_name || SETTINGS.name}
    </span>;

    return (
      <LinkContainer to={{ pathname: '/dashboard' }} active={false}>
        <SplitButton
          title={title}
          bsStyle="danger"
          id="logout-button">
          <LinkContainer to={{ pathname: '/profile' }} active={false}>
            <MenuItem>
              Profile
            </MenuItem>
          </LinkContainer>
          <MenuItem
            href="/settings">
            Settings
          </MenuItem>
          <MenuItem
            href="/logout"
            eventKey="logout">
            Logout
          </MenuItem>
        </SplitButton>
      </LinkContainer>
    );
  }
}

LoginButton.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  profile: React.PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
  return {
    profile: state.userProfile.profile
  };
};

export default connect(mapStateToProps)(LoginButton);
