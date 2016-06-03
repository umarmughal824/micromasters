/* global SETTINGS: false */
import '../global_init';
import TestUtils from 'react-addons-test-utils';
import assert from 'assert';

import {
  REQUEST_PATCH_USER_PROFILE,
  RECEIVE_PATCH_USER_PROFILE_SUCCESS,
  START_PROFILE_EDIT,
  UPDATE_PROFILE_VALIDATION
} from '../actions';
import { USER_PROFILE_RESPONSE } from '../constants';
import IntegrationTestHelper from '../util/integration_test_helper';
import * as api from '../util/api';

describe("ProfilePage", function() {
  this.timeout(5000);  // eslint-disable-line no-invalid-this

  let listenForActions, renderComponent, helper, patchUserProfileStub;
  let pageUrlStubs = [
    '/profile/personal',
    '/profile/education',
    '/profile/professional',
    '/profile/privacy'
  ];
  let lastPage = pageUrlStubs[pageUrlStubs.length - 1];
  let prevButtonSelector = '.progress-button.previous';
  let nextButtonSelector = '.progress-button.next';

  beforeEach(() => {
    helper = new IntegrationTestHelper();
    listenForActions = helper.listenForActions.bind(helper);
    renderComponent = helper.renderComponent.bind(helper);
    patchUserProfileStub = helper.sandbox.stub(api, 'patchUserProfile');
  });

  afterEach(() => {
    helper.cleanup();
  });

  let confirmSaveButtonBehavior = (updatedProfile, pageElements) => {
    let { div, button } = pageElements;
    button = button || div.querySelector(nextButtonSelector);
    patchUserProfileStub.throws("Invalid arguments");
    patchUserProfileStub.withArgs(SETTINGS.username, updatedProfile).returns(Promise.resolve(updatedProfile));
    return listenForActions([
      REQUEST_PATCH_USER_PROFILE,
      RECEIVE_PATCH_USER_PROFILE_SUCCESS,
      START_PROFILE_EDIT,
      UPDATE_PROFILE_VALIDATION
    ], () => {
      TestUtils.Simulate.click(button);
    });
  };

  it('navigates backward when Previous button is clicked', () => {
    let firstPage = pageUrlStubs[0];
    let secondPage = pageUrlStubs[1];
    renderComponent(secondPage).then(([, div]) => {
      let button = div.querySelector(prevButtonSelector);
      assert.equal(helper.currentLocation.pathname, secondPage);
      TestUtils.Simulate.click(button);
      assert.equal(helper.currentLocation.pathname, firstPage);
    });
  });

  it(`marks email_optin and filled_out when saving ${lastPage}`, done => {
    renderComponent(lastPage).then(([, div]) => {
      let button = div.querySelector(nextButtonSelector);
      assert(button.innerHTML.includes("I'm Done!"));
      let updatedProfile = Object.assign({}, USER_PROFILE_RESPONSE, {
        email_optin: true,
        filled_out: true
      });
      confirmSaveButtonBehavior(updatedProfile, {button: button}).then(() => {
        done();
      });
    });
  });

  for (let pageUrlStub of pageUrlStubs.slice(0,3)) {
    for (let filledOutValue of [true, false]) {
      it(`respects the current value (${filledOutValue}) when saving on ${pageUrlStub}`, done => {
        let updatedProfile = Object.assign({}, USER_PROFILE_RESPONSE, {filled_out: filledOutValue});
        helper.profileGetStub.returns(Promise.resolve(updatedProfile));
        renderComponent(pageUrlStub).then(([, div]) => {
          confirmSaveButtonBehavior(updatedProfile, {div: div}).then(() => {
            done();
          });
        });
      });
    }
  }
});
