/* global SETTINGS: false */
import React from 'react';
import { connect } from 'react-redux';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import LinkContainer from 'react-router-bootstrap/lib/LinkContainer';
import MenuItem from 'react-bootstrap/lib/MenuItem';

class LoginButton extends React.Component {
  render() {
    const { profile } = this.props;

    return (
      <DropdownButton
        title={profile.preferred_name || SETTINGS.name}
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
      </DropdownButton>
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
