import React from 'react';
import LoginButton from '../containers/LoginButton';
import { Navbar } from 'react-bootstrap';
import Link from 'react-router/lib/Link';

class Header extends React.Component {
  render () {
    const { empty } = this.props;
    let content;
    if (!empty) {
      content = <div>
        <ul className="nav navbar-toolbar navbar-left">
          <li role="presentation">
            <Link to="/dashboard">
              Dashboard
            </Link>
          </li>
        </ul>
        <div className="nav-utility pull-right">
          <LoginButton />
        </div>
      </div>;
    }

    return (
      <Navbar bsStyle="default" fluid={true}>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="/">
              <img src="/static/images/logo-micromasters@2x.png" width="215" height="40" alt="MIT Micromasters" />
            </a>
          </Navbar.Brand>
          {content}
        </Navbar.Header>
      </Navbar>
    );
  }
}

Header.propTypes = {
  empty: React.PropTypes.bool
};

export default Header;
