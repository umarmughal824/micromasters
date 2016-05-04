import ReactDOM from 'react-dom';
import configureTestStore from 'redux-asserts';
import sinon from 'sinon';
import { createMemoryHistory } from 'react-router';

import * as api from '../util/api';
import {
  COURSE_LIST_RESPONSE,
  DASHBOARD_RESPONSE,
  PROGRAM_LIST_RESPONSE,
  USER_PROFILE_RESPONSE,
} from '../constants';
import {
  REQUEST_COURSE_LIST,
  REQUEST_DASHBOARD,
  REQUEST_GET_USER_PROFILE,
  RECEIVE_COURSE_LIST_SUCCESS,
  RECEIVE_DASHBOARD_SUCCESS,
  RECEIVE_GET_USER_PROFILE_SUCCESS,
} from '../actions';
import rootReducer from '../reducers';
import { makeDashboardRoutes } from '../dashboard_routes';

class IntegrationTestHelper {

  constructor() {
    this.sandbox = sinon.sandbox.create();
    this.store = configureTestStore((...args) => {
      // uncomment to listen on dispatched actions
      // console.log(args);
      return rootReducer(...args);
    });

    this.listenForActions = this.store.createListenForActions();
    this.dispatchThen = this.store.createDispatchThen();

    this.programStub = this.sandbox.stub(api, 'getProgramList');
    this.programStub.returns(Promise.resolve(PROGRAM_LIST_RESPONSE));
    this.courseStub = this.sandbox.stub(api, 'getCourseList');
    this.courseStub.returns(Promise.resolve(COURSE_LIST_RESPONSE));
    this.dashboardStub = this.sandbox.stub(api, 'getDashboard');
    this.dashboardStub.returns(Promise.resolve(DASHBOARD_RESPONSE));
    this.profileGetStub = this.sandbox.stub(api, 'getUserProfile');
    this.profileGetStub.returns(Promise.resolve(USER_PROFILE_RESPONSE));
    this.browserHistory = createMemoryHistory();
    this.currentLocation = null;
    this.browserHistory.listen(url => {
      this.currentLocation = url;
    });
  }

  cleanup() {
    this.sandbox.restore();
  }

  renderComponent(url = "/", extraTypesToAssert = []) {
    return new Promise(resolve => {
      let expectedTypes = [
        REQUEST_COURSE_LIST,
        REQUEST_DASHBOARD,
        REQUEST_GET_USER_PROFILE,
        RECEIVE_COURSE_LIST_SUCCESS,
        RECEIVE_DASHBOARD_SUCCESS,
        RECEIVE_GET_USER_PROFILE_SUCCESS,
      ];

      expectedTypes.push(...extraTypesToAssert);
      let component, div;

      this.listenForActions(expectedTypes, () => {
        this.browserHistory.push(url);
        div = document.createElement("div");
        component = ReactDOM.render(
          makeDashboardRoutes(this.browserHistory, this.store, () => null, false),
          div
        );
      }).then(() => {
        resolve([component, div]);
      });
    });
  }
}

export default IntegrationTestHelper;