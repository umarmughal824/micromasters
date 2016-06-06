/* global SETTINGS: false */
import '../global_init';
import TestUtils from 'react-addons-test-utils';
import assert from 'assert';
import _ from 'lodash';

import { 
  RECEIVE_GET_USER_PROFILE_SUCCESS,
  REQUEST_GET_USER_PROFILE,
  START_PROFILE_EDIT,
  UPDATE_PROFILE,
  UPDATE_PROFILE_VALIDATION,
  REQUEST_PATCH_USER_PROFILE,
  RECEIVE_PATCH_USER_PROFILE_SUCCESS,
} from '../actions';
import {
  SET_WORK_DIALOG_VISIBILITY,
  SET_WORK_DIALOG_INDEX
} from '../actions/ui';
import IntegrationTestHelper from '../util/integration_test_helper';
import * as api from '../util/api';
import { USER_PROFILE_RESPONSE } from '../constants';

describe("UserPage", () => {
  let listenForActions, renderComponent, helper, patchUserProfileStub;
  beforeEach(() => {
    helper = new IntegrationTestHelper();
    listenForActions = helper.listenForActions.bind(helper);
    renderComponent = helper.renderComponent.bind(helper);

    patchUserProfileStub = helper.sandbox.stub(api, 'patchUserProfile');

    helper.profileGetStub.returns(
      Promise.resolve(Object.assign({}, USER_PROFILE_RESPONSE))
    );
  });

  let userActions = [RECEIVE_GET_USER_PROFILE_SUCCESS, REQUEST_GET_USER_PROFILE];

  afterEach(() => {
    helper.cleanup();
  });

  describe("Employment History", () => {
    it('shows the employment history component', done => {
      renderComponent(`/users/${SETTINGS.username}`, userActions).then(([, div]) => {
        let title = div.getElementsByClassName('profile-card-title')[0];
        assert.equal(title.textContent, 'Employment');
        done();
      });
    });

    it('should let you delete a work history entry', done => {

      renderComponent(`/users/${SETTINGS.username}`, userActions).then(([, div]) => {
        let updatedProfile = _.cloneDeep(USER_PROFILE_RESPONSE);
        updatedProfile.work_history.splice(0,1);

        patchUserProfileStub.throws("Invalid arguments");
        patchUserProfileStub.withArgs(SETTINGS.username, updatedProfile).returns(
          Promise.resolve(updatedProfile)
        );

        let deleteButton = div.getElementsByClassName('profile-tab-card')[0].
          getElementsByClassName('profile-row-icons')[0].
          getElementsByClassName('mdl-button')[1];

        listenForActions([
          START_PROFILE_EDIT,
          UPDATE_PROFILE_VALIDATION,
          REQUEST_PATCH_USER_PROFILE,
          RECEIVE_PATCH_USER_PROFILE_SUCCESS,
        ], () => {
          TestUtils.Simulate.click(deleteButton);
        }).then(() => {
          done();
        });
      });
    });

    it('should let you edit a work history entry', done => {
      renderComponent(`/users/${SETTINGS.username}`, userActions).then(([, div]) => {

        let editButton = div.getElementsByClassName('profile-tab-card')[0].
          getElementsByClassName('profile-row-icons')[0].
          getElementsByClassName('mdl-button')[0];

        listenForActions([
          SET_WORK_DIALOG_INDEX,
          SET_WORK_DIALOG_VISIBILITY
        ], () => {
          TestUtils.Simulate.click(editButton);
        }).then(() => {
          done();
        });
      });
    });

    it('should let you add a work history entry', done => {
      renderComponent(`/users/${SETTINGS.username}`, userActions).then(([, div]) => {
        let editButton = div.getElementsByClassName('profile-tab-card')[0].
          getElementsByClassName('profile-add-button')[0];

        listenForActions([
          START_PROFILE_EDIT,
          UPDATE_PROFILE,
          SET_WORK_DIALOG_INDEX,
          SET_WORK_DIALOG_VISIBILITY
        ], () => {
          TestUtils.Simulate.click(editButton);
        }).then(() => {
          done();
        });
      });
    });
  });
});
