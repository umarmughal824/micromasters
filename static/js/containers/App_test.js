/* global document: false, window: false */
import '../global_init';

import ReactDOM from 'react-dom';
import assert from 'assert';

import { CLEAR_DASHBOARD, CLEAR_PROFILE, } from '../actions';
import {
  UPDATE_DIALOG_TEXT,
  UPDATE_DIALOG_TITLE,
  SET_DIALOG_VISIBILITY,
  CLEAR_UI,
} from '../actions/ui';

import { USER_PROFILE_RESPONSE } from '../constants';
import IntegrationTestHelper from '../util/integration_test_helper';
import EmploymentTab from '../components/EmploymentTab';

describe('App', () => {
  let listenForActions, renderComponent, helper;
  let dialogActions; 

  beforeEach(() => {
    helper = new IntegrationTestHelper();
    listenForActions = helper.listenForActions.bind(helper);
    renderComponent = helper.renderComponent.bind(helper);
    dialogActions = [
      UPDATE_DIALOG_TEXT,
      UPDATE_DIALOG_TITLE,
      SET_DIALOG_VISIBILITY,
    ];
  });

  afterEach(() => {
    helper.cleanup();
  });

  it('clears profile, ui, and dashboard after unmounting', done => {
    renderComponent("/dashboard").then(([component, div]) => {  // eslint-disable-line no-unused-vars
      listenForActions([CLEAR_DASHBOARD, CLEAR_PROFILE, CLEAR_UI], () => {
        ReactDOM.unmountComponentAtNode(div);
      }).then(() => {
        done();
      });
    });
  });

  describe('profile completeness', () => {
    it('redirects to /profile if profile is not complete', done => {
      let response = Object.assign({}, USER_PROFILE_RESPONSE, {
        first_name: undefined
      });
      helper.profileGetStub.returns(Promise.resolve(response));

      renderComponent("/dashboard", dialogActions).then(() => {
        assert.equal(helper.currentLocation.pathname, "/profile/personal");
        done();
      });
    });

    it('redirects to /profile/professional if a field is missing there', done => {
      // USER_PROFILE_RESPONSE doesn't have `current_employed`
      let workHistory = {};
      EmploymentTab.nestedValidationKeys.forEach( k => {
        workHistory[k] = k === "city" ? "" : "filled in";
      });

      let response = Object.assign({}, USER_PROFILE_RESPONSE, {
        work_history: [workHistory]
      });
      helper.profileGetStub.returns(Promise.resolve(response));

      renderComponent("/dashboard", dialogActions).then(() => {
        assert.equal(helper.currentLocation.pathname, "/profile/professional");
        done();
      });
    });

    it("doesn't check work_history if currently_employed = 'no'", done => {
      let response = Object.assign({}, USER_PROFILE_RESPONSE, {
        currently_employed: "no"
      });
      helper.profileGetStub.returns(Promise.resolve(response));

      renderComponent("/dashboard").then(() => {
        assert.equal(helper.currentLocation.pathname, "/dashboard");
        done();
      });
    });

    it("checks work_history if currently_employed = 'yes'", done => {
      let workHistory = {};
      EmploymentTab.nestedValidationKeys.forEach( k => {
        workHistory[k] = k === "city" ? undefined : "filled in";
      });
      let response = Object.assign({}, USER_PROFILE_RESPONSE, {
        currently_employed: "yes",
        work_history: [workHistory]
      });
      helper.profileGetStub.returns(Promise.resolve(response));

      renderComponent("/dashboard", dialogActions).then(() => {
        assert.equal(helper.currentLocation.pathname, "/profile/professional");
        done();
      });
    });

    it('redirects to /profile/privacy if a field is missing there', done => {
      let response = Object.assign({}, USER_PROFILE_RESPONSE, {
        account_privacy: ''
      });
      helper.profileGetStub.returns(Promise.resolve(response));

      renderComponent("/dashboard", dialogActions).then(() => {
        assert.equal(helper.currentLocation.pathname, "/profile/privacy");
        done();
      });
    });

    it('sets a dialog with appropriate text for personal info', done => {
      let response = Object.assign({}, USER_PROFILE_RESPONSE, {
        first_name: undefined
      });
      helper.profileGetStub.returns(Promise.resolve(response));

      renderComponent("/dashboard", dialogActions).then(() => {
        let state = helper.store.getState();
        assert.deepEqual(state.ui.dialog, {
          visible: true,
          title: "Personal Info",
          text: "Please complete your personal information.",
        });
        assert.equal(helper.currentLocation.pathname, "/profile/personal");
        done();
      });
    });

    it('sets a dialog with appropriate text for professional info', done => {
      let workHistory = {};
      EmploymentTab.nestedValidationKeys.forEach( k => {
        workHistory[k] = k === "city" ? undefined : "filled in";
      });
      let response = Object.assign({}, USER_PROFILE_RESPONSE, {
        currently_employed: "yes",
        work_history: [workHistory]
      });
      helper.profileGetStub.returns(Promise.resolve(response));

      renderComponent("/dashboard", dialogActions).then(() => {
        let state = helper.store.getState();
        assert.deepEqual(state.ui.dialog, {
          visible: true,
          title: "Professional Info",
          text: "Please complete your work history information.",
        });
        assert.equal(helper.currentLocation.pathname, "/profile/professional");
        done();
      });
    });

    it('sets a dialog with appropriate text for privacy info', done => {
      let response = Object.assign({}, USER_PROFILE_RESPONSE, {
        account_privacy: ''
      });
      helper.profileGetStub.returns(Promise.resolve(response));

      renderComponent("/dashboard", dialogActions).then(() => {
        let state = helper.store.getState();
        assert.deepEqual(state.ui.dialog, {
          visible: true,
          title: "Privacy Settings",
          text: "Please complete the privacy settings.",
        });
        assert.equal(helper.currentLocation.pathname, "/profile/privacy");
        done();
      });
    });

  });
});
