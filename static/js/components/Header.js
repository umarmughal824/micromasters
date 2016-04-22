import React from 'react';
import LoginButton from '../containers/LoginButton';
import { Navbar } from 'react-bootstrap';
import Link from 'react-router/lib/Link';

class Header extends React.Component {
  render () {
    return (
      <Navbar bsStyle="default" fluid={true}>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="/">
              <img src="/static/images/logo-micromasters@2x.png" width="215" height="40" alt="MIT Micromasters" />
            </a>
          </Navbar.Brand>
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
        </Navbar.Header>
      </Navbar>
    );
  }
}

export default Header;
