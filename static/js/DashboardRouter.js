// @flow
/* global SETTINGS: false */
import React from 'react';
import { Route, Router, IndexRedirect } from 'react-router';
import { Provider } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import type { Store } from 'redux';

import App from './containers/App';
import DashboardPage from './containers/DashboardPage';
import SettingsPage from './containers/SettingsPage';
import ProfilePage from './containers/ProfilePage';
import UserPage from './containers/UserPage';
import User from './components/User';
import LearnerSearchPage from './containers/LearnerSearchPage';

export default class DashboardRouter extends React.Component {
  props: {
    browserHistory: Object,
    onRouteUpdate:  () => void,
    store:          Store,
  };

  render () {
    const {
      browserHistory,
      onRouteUpdate,
      store
    } = this.props;
    const username = SETTINGS.user ? SETTINGS.user.username : '';

    return <div>
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <Provider store={store}>
          <Router history={browserHistory} onUpdate={onRouteUpdate}>
            <Route path="/" component={App}>
              <Route path="dashboard" component={DashboardPage} />
              <Route path="profile" component={ProfilePage} />
              <Route path="/settings" component={SettingsPage}  />
              <Route path="/learner" component={UserPage} >
                <IndexRedirect to={username} />
              <Route path=":username" component={User} />
              </Route>
              <Route path="/learners" component={LearnerSearchPage} />
            </Route>
          </Router>
        </Provider>
      </MuiThemeProvider>
    </div>;
  }
}
