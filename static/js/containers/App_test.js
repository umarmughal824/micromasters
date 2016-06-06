/* global document: false, window: false */
import '../global_init';

import ReactDOM from 'react-dom';
import assert from 'assert';
import _ from 'lodash';

import {
  CLEAR_DASHBOARD,
  CLEAR_PROFILE,
  START_PROFILE_EDIT,
  UPDATE_PROFILE_VALIDATION,
} from '../actions';
import {
  CLEAR_UI,
} from '../actions/ui';
import { USER_PROFILE_RESPONSE } from '../constants';
import IntegrationTestHelper from '../util/integration_test_helper';

describe('App', () => {
  let listenForActions, renderComponent, helper;
  let editProfileActions;

  beforeEach(() => {
    helper = new IntegrationTestHelper();
    listenForActions = helper.listenForActions.bind(helper);
    renderComponent = helper.renderComponent.bind(helper);
    editProfileActions = [
      START_PROFILE_EDIT,
      UPDATE_PROFILE_VALIDATION
    ];
  });

  afterEach(() => {
    helper.cleanup();
  });

  it('clears profile, ui, and dashboard after unmounting', done => {
    renderComponent("/dashboard").then(([, div]) => {
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

      renderComponent("/dashboard", editProfileActions).then(() => {
        assert.equal(helper.currentLocation.pathname, "/profile/personal");
        done();
      });
    });

    it('redirects to /profile if profile is not filled out', done => {
      let response = Object.assign({}, USER_PROFILE_RESPONSE, {
        filled_out: false
      });
      helper.profileGetStub.returns(Promise.resolve(response));

      renderComponent("/dashboard").then(() => {
        assert.equal(helper.currentLocation.pathname, "/profile/personal");
        done();
      });
    });

    it('redirects to /profile/professional if a field is missing there', done => {
      let profile = _.cloneDeep(USER_PROFILE_RESPONSE);
      profile.work_history[1].city = "";

      helper.profileGetStub.returns(Promise.resolve(profile));
      renderComponent("/dashboard", editProfileActions).then(() => {
        assert.equal(helper.currentLocation.pathname, "/profile/professional");
        done();
      });
    });

    it('redirects to /profile/privacy if a field is missing there', done => {
      let response = Object.assign({}, USER_PROFILE_RESPONSE, {
        account_privacy: ''
      });
      helper.profileGetStub.returns(Promise.resolve(response));

      renderComponent("/dashboard", editProfileActions).then(() => {
        assert.equal(helper.currentLocation.pathname, "/profile/privacy");
        done();
      });
    });

    it('redirects to /profile/education if a field is missing there', done => {
      let response = _.cloneDeep(USER_PROFILE_RESPONSE);
      response.education[0].school_name = '';
      helper.profileGetStub.returns(Promise.resolve(response));

      renderComponent("/dashboard", editProfileActions).then(() => {
        assert.equal(helper.currentLocation.pathname, "/profile/education");
        done();
      });
    });
  });
});
