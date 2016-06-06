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
  SET_WORK_DIALOG_INDEX,
  SET_EDUCATION_DEGREE_LEVEL,
  SET_EDUCATION_DIALOG_INDEX,
  SET_EDUCATION_DIALOG_VISIBILITY,
  SET_USER_PAGE_DIALOG_VISIBILITY,
  SET_DELETION_INDEX,
  SET_SHOW_WORK_DELETE_DIALOG,
  SET_SHOW_EDUCATION_DELETE_DIALOG,
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

  let openDialog = () => {
    return [...document.getElementsByClassName('deletion-confirmation')].find(dialog => (
      dialog.style["left"] === "0px"
    ));
  };

  afterEach(() => {
    helper.cleanup();
  });

  describe("Education History", () => {
    let deleteButton = div => {
      return div.getElementsByClassName('profile-tab-card')[1].
        getElementsByClassName('delete-button')[0];
    };

    it('shows the education component', done => {
      renderComponent(`/users/${SETTINGS.username}`, userActions).then(([, div]) => {
        let title = div.getElementsByClassName('profile-card-title')[1];
        assert.equal(title.textContent, 'High school');
        done();
      });
    });

    it('should confirm deletion and let you cancel', done => {
      renderComponent(`/users/${SETTINGS.username}`, userActions).then(([, div]) => {
        let button = deleteButton(div);

        listenForActions([
          SET_DELETION_INDEX,
          SET_SHOW_EDUCATION_DELETE_DIALOG,
          SET_SHOW_EDUCATION_DELETE_DIALOG,
          SET_SHOW_WORK_DELETE_DIALOG,
          SET_DELETION_INDEX
        ], () => {
          TestUtils.Simulate.click(button);
          let dialog = openDialog();
          let cancelButton = dialog.getElementsByClassName('cancel-button')[0];
          TestUtils.Simulate.click(cancelButton);
        }).then(() => {
          done();
        });
      });
    });

    it('should confirm deletion and let you continue', done => {
      renderComponent(`/users/${SETTINGS.username}`, userActions).then(([, div]) => {
        let updatedProfile = _.cloneDeep(USER_PROFILE_RESPONSE);
        updatedProfile.education.splice(0,1);

        patchUserProfileStub.throws("Invalid arguments");
        patchUserProfileStub.withArgs(SETTINGS.username, updatedProfile).returns(
          Promise.resolve(updatedProfile)
        );

        let button = deleteButton(div);

        listenForActions([
          SET_DELETION_INDEX,
          SET_SHOW_EDUCATION_DELETE_DIALOG,
          START_PROFILE_EDIT,
          UPDATE_PROFILE_VALIDATION,
          SET_SHOW_EDUCATION_DELETE_DIALOG,
          SET_SHOW_WORK_DELETE_DIALOG,
          SET_DELETION_INDEX,
          REQUEST_PATCH_USER_PROFILE,
          RECEIVE_PATCH_USER_PROFILE_SUCCESS,
        ], () => {
          TestUtils.Simulate.click(button);
          let dialog = openDialog();
          button = dialog.getElementsByClassName('delete-button')[0];
          TestUtils.Simulate.click(button);
        }).then(() => {
          done();
        });
      });
    });

    it('should let you edit an education entry', done => {
      renderComponent(`/users/${SETTINGS.username}`, userActions).then(([, div]) => {

        let editButton = div.getElementsByClassName('profile-tab-card')[1].
          getElementsByClassName('profile-row-icons')[0].
          getElementsByClassName('mdl-button')[0];

        listenForActions([
          SET_EDUCATION_DIALOG_INDEX,
          SET_EDUCATION_DIALOG_VISIBILITY,
          SET_EDUCATION_DEGREE_LEVEL,
        ], () => {
          TestUtils.Simulate.click(editButton);
        }).then(() => {
          done();
        });
      });
    });

    it('should let you add an education entry', done => {
      renderComponent(`/users/${SETTINGS.username}`, userActions).then(([, div]) => {
        let editButton = div.getElementsByClassName('profile-tab-card')[1].
          getElementsByClassName('profile-add-button')[0];

        listenForActions([
          START_PROFILE_EDIT,
          UPDATE_PROFILE,
          SET_EDUCATION_DIALOG_INDEX,
          SET_EDUCATION_DIALOG_VISIBILITY,
          SET_EDUCATION_DEGREE_LEVEL,
        ], () => {
          TestUtils.Simulate.click(editButton);
        }).then(() => {
          done();
        });
      });
    });
  });

  describe("Employment History", () => {
    let deleteButton = div => {
      return div.getElementsByClassName('profile-tab-card')[0].
        getElementsByClassName('profile-row-icons')[0].
        getElementsByClassName('mdl-button')[1];
    };

    it('shows the employment history component', done => {
      renderComponent(`/users/${SETTINGS.username}`, userActions).then(([, div]) => {
        let title = div.getElementsByClassName('profile-card-title')[0];
        assert.equal(title.textContent, 'Employment');
        done();
      });
    });

    it('should confirm deletion and let you cancel', done => {
      renderComponent(`/users/${SETTINGS.username}`, userActions).then(([, div]) => {
        let button = deleteButton(div);

        listenForActions([
          SET_DELETION_INDEX,
          SET_SHOW_WORK_DELETE_DIALOG,
          SET_SHOW_WORK_DELETE_DIALOG,
          SET_SHOW_EDUCATION_DELETE_DIALOG,
          SET_DELETION_INDEX,
        ], () => {
          TestUtils.Simulate.click(button);
          let dialog = openDialog();
          let cancelButton = dialog.getElementsByClassName('cancel-button')[0];
          TestUtils.Simulate.click(cancelButton);
        }).then(() => {
          done();
        });
      });
    });

    it('should confirm deletion and let you continue', done => {
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
          SET_DELETION_INDEX,
          SET_SHOW_WORK_DELETE_DIALOG,
          START_PROFILE_EDIT,
          UPDATE_PROFILE_VALIDATION,
          SET_SHOW_EDUCATION_DELETE_DIALOG,
          SET_SHOW_WORK_DELETE_DIALOG,
          SET_DELETION_INDEX,
          REQUEST_PATCH_USER_PROFILE,
          RECEIVE_PATCH_USER_PROFILE_SUCCESS,
        ], () => {
          TestUtils.Simulate.click(deleteButton);
          let dialog = openDialog();
          let button = dialog.getElementsByClassName('delete-button')[0];
          TestUtils.Simulate.click(button);
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

  describe('Personal Info', () => {
    it('should show name and location', done => {
      renderComponent(`/users/${SETTINGS.username}`, userActions).then(([, div]) => {
        let name = div.getElementsByClassName('users-name')[0].textContent;
        assert.deepEqual(name, USER_PROFILE_RESPONSE.preferred_name);

        let location = div.getElementsByClassName('users-location')[0].textContent;

        assert.deepEqual(location, `${USER_PROFILE_RESPONSE.city}, `);
        done();
      });
    });

    it('should let you edit personal info', done => {
      renderComponent(`/users/${SETTINGS.username}`, userActions).then(([, div]) => {
        let personalButton = div.getElementsByClassName('material-icons')[0];

        listenForActions([SET_USER_PAGE_DIALOG_VISIBILITY], () => {
          TestUtils.Simulate.click(personalButton);
        }).then(() => {
          done();
        });
      });
    });
  });
});
