import React from 'react';
import LoginButton from '../containers/LoginButton';
import Link from 'react-router/lib/Link';

class Header extends React.Component {
  render() {
    return <div id="header">
      <div className="header-logo">
        <a href="/" alt="MIT Micromasters">
          <img src="/static/images/mit-white.png" alt="MIT"/>
        </a>
      </div>
      <div className="header-links-dashboard">
        <Link to="/dashboard" activeClassName="selected">
          Dashboard
        </Link>
      </div>
      <div className="header-links-programs">
        Programs
      </div>
      <div className="header-links-login">
        <LoginButton />
      </div>
    </div>;
  }
}

export default Header;
