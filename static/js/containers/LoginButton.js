import React from 'react';
import { connect } from 'react-redux';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Link from 'react-router/lib/Link';

class LoginButton extends React.Component {
  render() {
    const { authentication } = this.props;

    return (
      <DropdownButton
        title={authentication.name}
        id="logout-button">
        <MenuItem>
          <Link to="/profile">
            Profile
          </Link>
        </MenuItem>
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
  authentication: React.PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
  return {
    authentication: state.authentication
  };
};

export default connect(mapStateToProps)(LoginButton);
