/* global SETTINGS:false */
__webpack_public_path__ = `http://${SETTINGS.host}:8078/`;  // eslint-disable-line no-undef, camelcase
import React from 'react';
import ReactDOM from 'react-dom';
import DashboardPage from './containers/DashboardPage';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import { devTools, persistState } from 'redux-devtools';
import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import ga from 'react-ga';

const store = configureStore();

let debug = SETTINGS.reactGaDebug === "true";
ga.initialize(SETTINGS.gaTrackingID, { debug: debug });

let debugTools;
if (process.env.NODE_ENV !== 'production') {
  debugTools = <DebugPanel top right bottom>
    <DevTools store={store} monitor={LogMonitor} visibleOnLoad={false}/>
  </DebugPanel>;
}

ReactDOM.render(
  <div>
    <Provider store={store}>
      <Router history={browserHistory}>
        <Route path="/dashboard" component={DashboardPage} onUpdate={ga.pageview(window.location.pathname)}></Route>
      </Router>
    </Provider>
    {debugTools}
  </div>,
  document.getElementById("dashboard")
);
