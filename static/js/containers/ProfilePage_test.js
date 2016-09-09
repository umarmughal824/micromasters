/* global SETTINGS: false */
import TestUtils from 'react-addons-test-utils';
import { assert } from 'chai';
import _ from 'lodash';

import {
  REQUEST_GET_USER_PROFILE,
  REQUEST_PATCH_USER_PROFILE,
  RECEIVE_PATCH_USER_PROFILE_SUCCESS,
  START_PROFILE_EDIT,
  UPDATE_PROFILE_VALIDATION,
  CLEAR_PROFILE_EDIT,

  receiveGetUserProfileSuccess,
} from '../actions/profile';
import {
  SET_SHOW_WORK_DELETE_ALL_DIALOG,
  SET_WORK_HISTORY_EDIT,

  setWorkHistoryEdit,
  setProfileStep,
} from '../actions/ui';
import {
  USER_PROFILE_RESPONSE,
  PERSONAL_STEP,
  EDUCATION_STEP,
  EMPLOYMENT_STEP,
  PRIVACY_STEP,
} from '../constants';
import IntegrationTestHelper from '../util/integration_test_helper';
import * as api from '../util/api';
import {
  activeDialog,
  activeDeleteDialog,
  noActiveDeleteDialogs
} from '../util/test_utils';

describe("ProfilePage", function() {
  this.timeout(5000);  // eslint-disable-line no-invalid-this

  let listenForActions, renderComponent, helper, patchUserProfileStub;
  let profileSteps = [
    PERSONAL_STEP,
    EDUCATION_STEP,
    EMPLOYMENT_STEP,
    PRIVACY_STEP,
  ];
  let prevButtonSelector = '.mm-button.prev';
  let nextButtonSelector = '.mm-button.next';

  const setStep = step => helper.store.dispatch(setProfileStep(step));

  beforeEach(() => {
    helper = new IntegrationTestHelper();
    listenForActions = helper.listenForActions.bind(helper);
    renderComponent = helper.renderComponent.bind(helper);
    patchUserProfileStub = helper.sandbox.stub(api, 'patchUserProfile');
  });

  afterEach(() => {
    helper.cleanup();
  });

  let confirmSaveButtonBehavior = (updatedProfile, pageElements, validationFailure=false, actions = []) => {
    let { div, button } = pageElements;
    button = button || div.querySelector(nextButtonSelector);
    patchUserProfileStub.throws("Invalid arguments");
    patchUserProfileStub.withArgs(SETTINGS.username, updatedProfile).returns(Promise.resolve(updatedProfile));

    if ( actions.length === 0 ) {
      if (!validationFailure) {
        actions.push(
          REQUEST_PATCH_USER_PROFILE,
          RECEIVE_PATCH_USER_PROFILE_SUCCESS,
        );
      }
      actions.push(
        START_PROFILE_EDIT,
        UPDATE_PROFILE_VALIDATION
      );
    }

    return listenForActions(actions, () => {
      TestUtils.Simulate.click(button);
    });
  };

  let radioToggles = (div, selector) => div.querySelector(selector).getElementsByTagName('input');

  describe('switch toggling behavior', () => {
    beforeEach(() => {
      helper.profileGetStub.
        withArgs(SETTINGS.username).
        returns(
          Promise.resolve(Object.assign({}, USER_PROFILE_RESPONSE, {
            username: SETTINGS.username
          }))
        );
    });

    it('should launch a dialog to add an entry when an education switch is set to Yes', () => {
      setStep(EDUCATION_STEP);
      return renderComponent('/profile').then(([, div]) => {
        let toggle = radioToggles(div, '.profile-radio-switch');
        TestUtils.Simulate.change(toggle[0]);
        activeDialog('education-dashboard-dialog');
      });
    });

    it('should let you cancel deletion when toggling work history to No', () => {
      setStep(EMPLOYMENT_STEP);
      return renderComponent('/profile').then(([, div]) => {
        let toggle = radioToggles(div, '.profile-radio-switch');

        return listenForActions([
          SET_SHOW_WORK_DELETE_ALL_DIALOG,
          SET_SHOW_WORK_DELETE_ALL_DIALOG,
        ], () => {
          TestUtils.Simulate.change(toggle[1]);
          let dialog = activeDeleteDialog();
          let cancelButton = dialog.querySelector('.cancel-button');
          TestUtils.Simulate.click(cancelButton);
          let state = helper.store.getState();
          let profile = state.profiles.jane.profile;
          assert.equal(_.isEmpty(profile.work_history), false);
        });
      });
    });

    it('should confirm and let you delete when toggling the switch on work history', () => {
      setStep(EMPLOYMENT_STEP);
      return renderComponent('/profile').then(([, div]) => {
        let updateProfile = _.cloneDeep(USER_PROFILE_RESPONSE);
        updateProfile.username = SETTINGS.username;
        updateProfile.work_history = [];

        patchUserProfileStub.throws("Invalid arguments");
        patchUserProfileStub.withArgs(SETTINGS.username, updateProfile).returns(
          Promise.resolve(updateProfile)
        );

        let toggle = radioToggles(div, '.profile-radio-switch');
        return listenForActions([
          SET_SHOW_WORK_DELETE_ALL_DIALOG,
          START_PROFILE_EDIT,
          UPDATE_PROFILE_VALIDATION,
          REQUEST_PATCH_USER_PROFILE,
          SET_WORK_HISTORY_EDIT,
          SET_SHOW_WORK_DELETE_ALL_DIALOG,
          RECEIVE_PATCH_USER_PROFILE_SUCCESS,
          CLEAR_PROFILE_EDIT,
        ], () => {
          TestUtils.Simulate.change(toggle[1]);
          let dialog = activeDeleteDialog();
          let deleteButton = dialog.querySelector('.delete-button');
          TestUtils.Simulate.click(deleteButton);
        }).then(() => {
          let state = helper.store.getState();
          let workHistory = state.profiles.jane.profile.work_history;
          assert.deepEqual(workHistory, []);
        });
      });

    });

    it('shouldnt confirm when toggling the switch on work history if there are no entries', () => {
      setStep(EMPLOYMENT_STEP);
      return renderComponent('/profile').then(([, div]) => {
        let emptyWorkHistory = Object.assign({}, USER_PROFILE_RESPONSE, {
          work_history: []
        });
        helper.store.dispatch(receiveGetUserProfileSuccess(SETTINGS.username, emptyWorkHistory));

        let toggle = radioToggles(div, '.profile-radio-switch');

        return listenForActions([
        ], () => {
          TestUtils.Simulate.change(toggle[0]);
          assert.isTrue(noActiveDeleteDialogs());
          TestUtils.Simulate.change(toggle[1]);
          assert.isTrue(noActiveDeleteDialogs());
        });
      });
    });
  });

  it('navigates backward when Previous button is clicked', () => {
    setStep(EDUCATION_STEP);
    const checkStep = () => helper.store.getState().ui.profileStep;
    return renderComponent('/profile').then(([, div]) => {
      let button = div.querySelector(prevButtonSelector);
      assert.equal(checkStep(), EDUCATION_STEP);
      TestUtils.Simulate.click(button);
      assert.equal(checkStep(), PERSONAL_STEP);
    });
  });

  it(`marks email_optin and filled_out when saving on privacy`, () => {
    setStep(PRIVACY_STEP);
    return renderComponent('/profile').then(([, div]) => {
      // close all switches and remove all education so we don't get validation errors
      let receivedProfile = Object.assign({}, USER_PROFILE_RESPONSE, {
        education: [],
        email_optin: true,
      });
      helper.store.dispatch(receiveGetUserProfileSuccess(SETTINGS.username, receivedProfile));

      let button = div.querySelector(nextButtonSelector);
      assert(button.innerHTML.includes("I'm Done!"));
      let updatedProfile = Object.assign({}, receivedProfile, {
        email_optin: true,
        filled_out: true
      });

      return confirmSaveButtonBehavior(updatedProfile, {button: button});
    });
  });

  it('does not validate education and employment switches when saving the privacy page', () => {
    setStep(PRIVACY_STEP);
    return renderComponent('/profile').then(([, div]) => {
      // close all switches and remove all education so we don't get validation errors
      let receivedProfile = Object.assign({}, USER_PROFILE_RESPONSE, {
        education: [],
        work_history: [],
        email_optin: true,
      });
      helper.store.dispatch(receiveGetUserProfileSuccess(SETTINGS.username, receivedProfile));
      helper.store.dispatch(setWorkHistoryEdit(true));

      let button = div.querySelector(nextButtonSelector);
      assert(button.innerHTML.includes("I'm Done!"));
      let updatedProfile = Object.assign({}, receivedProfile, {
        email_optin: true,
        filled_out: true
      });

      let actions = [
        START_PROFILE_EDIT,
        UPDATE_PROFILE_VALIDATION,
        REQUEST_PATCH_USER_PROFILE,
        RECEIVE_PATCH_USER_PROFILE_SUCCESS,
        CLEAR_PROFILE_EDIT,
      ];

      return confirmSaveButtonBehavior(updatedProfile, {button: button}, true, actions).then(state => {
        assert.deepEqual(state.profiles[SETTINGS.username].profile.edit, undefined);
      });
    });
  });

  for (let step of profileSteps.slice(0,3)) {
    for (let filledOutValue of [true, false]) {
      it(`respects the current value (${filledOutValue}) when saving on ${step}`, () => {
        setStep(step);
        let updatedProfile = Object.assign({}, USER_PROFILE_RESPONSE, {
          filled_out: filledOutValue,
          education: []
        });
        helper.profileGetStub.returns(Promise.resolve(updatedProfile));
        return renderComponent('/profile').then(([, div]) => {
          // close all switches
          return confirmSaveButtonBehavior(updatedProfile, {div: div});
        });
      });
    }
  }

  it('shows a spinner when profile get is processing', () => {
    return renderComponent('/profile').then(([, div]) => {
      assert.notOk(div.querySelector(".spinner"), "Found spinner but no fetch in progress");
      helper.store.dispatch({
        type: REQUEST_GET_USER_PROFILE,
        payload: {
          username: SETTINGS.username
        }
      });

      assert(div.querySelector(".spinner"), "Unable to find spinner");
    });
  });
});
