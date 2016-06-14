/* global document: false, window: false */
import '../global_init';

import ReactDOM from 'react-dom';
import { assert } from 'chai';
import _ from 'lodash';

import {
  CLEAR_DASHBOARD,
  CLEAR_PROFILE,
  RECEIVE_DASHBOARD_FAILURE,
  RECEIVE_GET_USER_PROFILE_SUCCESS,
  START_PROFILE_EDIT,
  UPDATE_PROFILE_VALIDATION,
} from '../actions';
import {
  CLEAR_UI,
} from '../actions/ui';
import {
  DASHBOARD_RESPONSE,
  DASHBOARD_RESPONSE_ERROR,
  USER_PROFILE_RESPONSE
} from '../constants';
import IntegrationTestHelper from '../util/integration_test_helper';

describe('App', () => {
  let listenForActions, renderComponent, helper;
  let editProfileActions;
  let dashboardErrorActions;

  beforeEach(() => {
    helper = new IntegrationTestHelper();
    listenForActions = helper.listenForActions.bind(helper);
    renderComponent = helper.renderComponent.bind(helper);
    editProfileActions = [
      START_PROFILE_EDIT,
      UPDATE_PROFILE_VALIDATION
    ];
    dashboardErrorActions = [
      RECEIVE_DASHBOARD_FAILURE,
      RECEIVE_GET_USER_PROFILE_SUCCESS
    ];
  });

  afterEach(() => {
    helper.cleanup();
  });

  it('clears profile, ui, and dashboard after unmounting', () => {
    return renderComponent("/dashboard").then(([, div]) => {
      return listenForActions([CLEAR_DASHBOARD, CLEAR_PROFILE, CLEAR_UI], () => {
        ReactDOM.unmountComponentAtNode(div);
      });
    });
  });

  describe('dashboard errors', () => {
    let errorString = `Sorry, we were unable to load the data necessary
      to process your request. Please reload the page.`;
    errorString = errorString.replace(/\s\s+/g, ' ');

    it('error from the backend triggers error message in dashboard', () => {
      helper.dashboardStub.returns(Promise.reject(DASHBOARD_RESPONSE_ERROR));

      return renderComponent("/dashboard", dashboardErrorActions, false).then(([, div]) => {
        let message = div.getElementsByClassName('alert-message')[0];
        assert(message.textContent.indexOf(errorString) > -1);
        assert(message.textContent.indexOf(DASHBOARD_RESPONSE_ERROR.error_code) > -1);
        assert(message.textContent.indexOf("Additional info:") > -1);
        assert(message.textContent.indexOf(DASHBOARD_RESPONSE_ERROR.user_message) > -1);
      });
    });

    it('the error from the backend does not need to be complete', () => {
      let response = _.cloneDeep(DASHBOARD_RESPONSE_ERROR);
      delete response.user_message;
      helper.dashboardStub.returns(Promise.reject(response));

      return renderComponent("/dashboard", dashboardErrorActions, false).then(([, div]) => {
        let message = div.getElementsByClassName('alert-message')[0];
        assert(message.textContent.indexOf(errorString) > -1);
        assert(message.textContent.indexOf(DASHBOARD_RESPONSE_ERROR.error_code) > -1);
        assert.equal(message.textContent.indexOf("Additional info:"), -1);
        assert.equal(message.textContent.indexOf(DASHBOARD_RESPONSE_ERROR.user_message), -1);
      });
    });

    it('the error from the backend does not need to exist at all as long as there is an http error', () => {
      helper.dashboardStub.returns(Promise.reject({}));

      return renderComponent("/dashboard", dashboardErrorActions, false).then(([, div]) => {
        let message = div.getElementsByClassName('alert-message')[0];
        assert(message.textContent.indexOf(errorString) > -1);
        assert.equal(message.textContent.indexOf(DASHBOARD_RESPONSE_ERROR.error_code), -1);
        assert.equal(message.textContent.indexOf("Additional info:"), -1);
        assert.equal(message.textContent.indexOf(DASHBOARD_RESPONSE_ERROR.user_message), -1);
      });
    });

    it('a regular response does not show the error', () => {
      helper.dashboardStub.returns(Promise.resolve(DASHBOARD_RESPONSE));

      return renderComponent("/dashboard").then(([, div]) => {
        let message = div.getElementsByClassName('alert-message')[0];
        assert.equal(message, undefined);
      });
    });
  });

  describe('profile completeness', () => {
    it('redirects to /profile if profile is not complete', () => {
      let response = Object.assign({}, USER_PROFILE_RESPONSE, {
        first_name: undefined
      });
      helper.profileGetStub.returns(Promise.resolve(response));

      return renderComponent("/dashboard", editProfileActions).then(() => {
        assert.equal(helper.currentLocation.pathname, "/profile/personal");
      });
    });

    it('redirects to /profile if profile is not filled out', () => {
      let response = Object.assign({}, USER_PROFILE_RESPONSE, {
        filled_out: false
      });
      helper.profileGetStub.returns(Promise.resolve(response));

      return renderComponent("/dashboard").then(() => {
        assert.equal(helper.currentLocation.pathname, "/profile/personal");
      });
    });

    it('redirects to /profile/professional if a field is missing there', () => {
      let profile = _.cloneDeep(USER_PROFILE_RESPONSE);
      profile.work_history[1].city = "";

      helper.profileGetStub.returns(Promise.resolve(profile));
      return renderComponent("/dashboard", editProfileActions).then(() => {
        assert.equal(helper.currentLocation.pathname, "/profile/professional");
      });
    });

    it('redirects to /profile/privacy if a field is missing there', () => {
      let response = Object.assign({}, USER_PROFILE_RESPONSE, {
        account_privacy: ''
      });
      helper.profileGetStub.returns(Promise.resolve(response));

      return renderComponent("/dashboard", editProfileActions).then(() => {
        assert.equal(helper.currentLocation.pathname, "/profile/privacy");
      });
    });

    it('redirects to /profile/education if a field is missing there', () => {
      let response = _.cloneDeep(USER_PROFILE_RESPONSE);
      response.education[0].school_name = '';
      helper.profileGetStub.returns(Promise.resolve(response));

      return renderComponent("/dashboard", editProfileActions).then(() => {
        assert.equal(helper.currentLocation.pathname, "/profile/education");
      });
    });
  });
});
