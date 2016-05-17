/* global SETTINGS: false */
import {
  fetchUserProfile,
  receiveGetUserProfileSuccess,
  clearProfile,
  saveProfile,
  updateProfile,
  updateProfileValidation,
  validateProfile,
  startProfileEdit,
  clearProfileEdit,
  REQUEST_GET_USER_PROFILE,
  RECEIVE_GET_USER_PROFILE_SUCCESS,
  RECEIVE_GET_USER_PROFILE_FAILURE,
  CLEAR_PROFILE,
  UPDATE_PROFILE,
  UPDATE_PROFILE_VALIDATION,
  START_PROFILE_EDIT,
  CLEAR_PROFILE_EDIT,
  REQUEST_PATCH_USER_PROFILE,
  RECEIVE_PATCH_USER_PROFILE_SUCCESS,
  RECEIVE_PATCH_USER_PROFILE_FAILURE,

  fetchDashboard,
  clearDashboard,
  REQUEST_DASHBOARD,
  RECEIVE_DASHBOARD_SUCCESS,
  RECEIVE_DASHBOARD_FAILURE,
  CLEAR_DASHBOARD,

  FETCH_FAILURE,
  FETCH_SUCCESS
} from '../actions/index';
import * as api from '../util/api';
import {
  DASHBOARD_RESPONSE,
  USER_PROFILE_RESPONSE,
} from '../constants';
import configureTestStore from 'redux-asserts';
import rootReducer, { INITIAL_USER_PROFILE_STATE } from '../reducers';
import assert from 'assert';
import sinon from 'sinon';
import PersonalTab from '../components/PersonalTab';

describe('reducers', () => {
  let sandbox, store, dispatchThen;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    store = configureTestStore(rootReducer);
  });
  afterEach(() => {
    sandbox.restore();

    store = null;
    dispatchThen = null;
  });

  describe('profile reducers', () => {
    let getUserProfileStub, patchUserProfileStub;
    beforeEach(() => {
      dispatchThen = store.createDispatchThen(state => state.userProfile);
      getUserProfileStub = sandbox.stub(api, 'getUserProfile');
      patchUserProfileStub = sandbox.stub(api, 'patchUserProfile');
    });

    it('should have initial state', done => {
      dispatchThen({type: 'unknown'}, ['unknown']).then(state => {
        assert.deepEqual(state, INITIAL_USER_PROFILE_STATE);
        done();
      });
    });

    it('should fetch user profile successfully then clear it', done => {
      getUserProfileStub.returns(Promise.resolve(USER_PROFILE_RESPONSE));

      dispatchThen(fetchUserProfile('jane'), [REQUEST_GET_USER_PROFILE, RECEIVE_GET_USER_PROFILE_SUCCESS]).
      then(profileState => {
        assert.deepEqual(profileState.profile, USER_PROFILE_RESPONSE);
        assert.equal(profileState.getStatus, FETCH_SUCCESS);

        assert.ok(getUserProfileStub.calledWith('jane'));

        dispatchThen(clearProfile(), [CLEAR_PROFILE]).then(state => {
          assert.deepEqual(state, INITIAL_USER_PROFILE_STATE);

          done();
        });
      });
    });

    it('should fail to fetch user profile', done => {
      getUserProfileStub.returns(Promise.reject());

      dispatchThen(fetchUserProfile('jane'), [REQUEST_GET_USER_PROFILE, RECEIVE_GET_USER_PROFILE_FAILURE]).
      then(profileState => {
        assert.equal(profileState.getStatus, FETCH_FAILURE);

        assert.ok(getUserProfileStub.calledWith('jane'));

        // assert that it returns a rejected promise on failure
        store.dispatch(fetchUserProfile('jane')).catch(() => {
          done();
        });
      });
    });

    it("should patch the profile successfully", done => {
      let updatedProfile = Object.assign({}, USER_PROFILE_RESPONSE, {
        change: true
      });
      patchUserProfileStub.returns(Promise.resolve(updatedProfile));

      dispatchThen(
        saveProfile('jane', USER_PROFILE_RESPONSE),
        [REQUEST_PATCH_USER_PROFILE, RECEIVE_PATCH_USER_PROFILE_SUCCESS]
      ).then(profileState => {
        assert.equal(profileState.patchStatus, FETCH_SUCCESS);
        assert.deepEqual(profileState.profile, updatedProfile);

        assert.ok(patchUserProfileStub.calledWith('jane', USER_PROFILE_RESPONSE));

        done();
      });
    });

    it("should fail to patch the profile", done => {
      patchUserProfileStub.returns(Promise.reject());

      dispatchThen(
        saveProfile('jane', USER_PROFILE_RESPONSE),
        [REQUEST_PATCH_USER_PROFILE, RECEIVE_PATCH_USER_PROFILE_FAILURE]
      ).then(profileState => {
        assert.equal(profileState.patchStatus, FETCH_FAILURE);

        assert.ok(patchUserProfileStub.calledWith('jane', USER_PROFILE_RESPONSE));

        // assert that it returns a rejected promise on failure
        store.dispatch(saveProfile('jane', USER_PROFILE_RESPONSE)).catch(() => {
          done();
        });
      });
    });

    it("should start editing the profile, update the copy, then clear it", done => {
      // populate a profile
      store.dispatch(receiveGetUserProfileSuccess(USER_PROFILE_RESPONSE));
      dispatchThen(startProfileEdit(), [START_PROFILE_EDIT]).then(profileState => {
        assert.deepEqual(profileState.edit, {
          profile: USER_PROFILE_RESPONSE,
          errors: {}
        });

        let newProfile = Object.assign({}, USER_PROFILE_RESPONSE, {
          newField: true
        });

        dispatchThen(updateProfile(newProfile), [UPDATE_PROFILE]).then(profileState => {
          assert.deepEqual(profileState.edit, {
            profile: newProfile,
            errors: {}
          });

          dispatchThen(clearProfileEdit(), [CLEAR_PROFILE_EDIT]).then(profileState => {
            assert.deepEqual(profileState.edit, undefined);

            done();
          });
        });
      });
    });

    it("should start editing the profile, and validate it", done => {
      // populate a profile
      store.dispatch(receiveGetUserProfileSuccess(USER_PROFILE_RESPONSE));
      store.dispatch(startProfileEdit());

      let errors = {error: "I am an error"};
      dispatchThen(updateProfileValidation(errors), [UPDATE_PROFILE_VALIDATION]).then(profileState => {
        assert.deepEqual(profileState.edit, {
          profile: USER_PROFILE_RESPONSE,
          errors: errors
        });

        done();
      });
    });

    it('should validate an existing profile successfully', done => {
      // populate a profile
      store.dispatch(receiveGetUserProfileSuccess(USER_PROFILE_RESPONSE));
      store.dispatch(startProfileEdit());

      dispatchThen(validateProfile(
        USER_PROFILE_RESPONSE,
        PersonalTab.defaultProps.requiredFields,
        PersonalTab.defaultProps.validationMessages
      ), [UPDATE_PROFILE_VALIDATION]).then(profileState => {
        assert.deepEqual(profileState.edit.errors, {});

        // also assert that it returns a resolved promise
        store.dispatch(validateProfile(
          USER_PROFILE_RESPONSE,
          PersonalTab.defaultProps.requiredFields,
          PersonalTab.defaultProps.validationMessages
        )).then(() => {
          done();
        });
      });
    });

    it('should validate an existing profile with validation errors', done => {
      let profileWithError = Object.assign({}, USER_PROFILE_RESPONSE, {
        first_name: ''
      });
      let keysToCheck = [["first_name"]];
      let messages = {"first_name": "Given name"};

      // populate a profile
      store.dispatch(receiveGetUserProfileSuccess(USER_PROFILE_RESPONSE));
      store.dispatch(startProfileEdit());
      dispatchThen(validateProfile(
        profileWithError,
        keysToCheck,
        messages
      ), [UPDATE_PROFILE_VALIDATION]).then(profileState => {
        assert.deepEqual(profileState.edit.errors, {
          first_name: 'Given name is required'
        });

        // also assert that it returns a rejected promise
        store.dispatch(validateProfile(
          profileWithError,
          keysToCheck,
          messages
        )).catch(() => {
          done();
        });
      });
    });

    it('should validate a profile with nested objects and errors', done => {
      let profileWithError = Object.assign({}, USER_PROFILE_RESPONSE, {
        work_history: [{
          company_name: "foocorp",
          position: undefined
        }]
      });
      let keysToCheck = [
        ["work_history", 0, "company_name"],
        ["work_history", 0, "position"],
      ];
      let messages = {
        "company_name": "Company name",
        "position": "Position",
      };

      // populate a profile
      store.dispatch(receiveGetUserProfileSuccess(USER_PROFILE_RESPONSE));
      store.dispatch(startProfileEdit());
      dispatchThen(validateProfile(
        profileWithError,
        keysToCheck,
        messages
      ), [UPDATE_PROFILE_VALIDATION]).then(profileState => {
        assert.deepEqual(profileState.edit.errors, {
          work_history: [
            {position: 'Position is required'}
          ]
        });

        // also assert that it returns a rejected promise
        store.dispatch(validateProfile(
          profileWithError,
          keysToCheck,
          messages
        )).catch(() => {
          done();
        });
      });
    });


    it("can't edit a profile if we never get it successfully", done => {
      dispatchThen(startProfileEdit(), [START_PROFILE_EDIT]).then(profileState => {
        assert.deepEqual(profileState.edit, undefined);
        done();
      });
    });

    it("can't edit a profile if edit doesn't exist", done => {
      dispatchThen(updateProfile(USER_PROFILE_RESPONSE), [UPDATE_PROFILE]).then(profileState => {
        assert.deepEqual(profileState.edit, undefined);
        done();
      });
    });

    it("can't validate a profile's edits if edit doesn't exist", done => {
      dispatchThen(updateProfileValidation({error: "an error"}), [UPDATE_PROFILE_VALIDATION]).then(profileState => {
        assert.deepEqual(profileState.edit, undefined);
        done();
      });
    });
  });

  describe('dashboard reducers', () => {
    let dashboardStub;

    beforeEach(() => {
      dispatchThen = store.createDispatchThen(state => state.dashboard);
      dashboardStub = sandbox.stub(api, 'getDashboard');
    });

    it('should have an empty default state', done => {
      dispatchThen({type: 'unknown'}, ['unknown']).then(state => {
        assert.deepEqual(state, {
          programs: []
        });
        done();
      });
    });

    it('should fetch the dashboard successfully then clear it', done => {
      dashboardStub.returns(Promise.resolve(DASHBOARD_RESPONSE));

      dispatchThen(fetchDashboard(), [REQUEST_DASHBOARD, RECEIVE_DASHBOARD_SUCCESS]).then(dashboardState => {
        assert.deepEqual(dashboardState.programs, DASHBOARD_RESPONSE);
        assert.equal(dashboardState.fetchStatus, FETCH_SUCCESS);

        dispatchThen(clearDashboard(), [CLEAR_DASHBOARD]).then(dashboardState => {
          assert.deepEqual(dashboardState, {
            programs: []
          });

          done();
        });
      });
    });

    it('should fail to fetch the dashboard', done => {
      dashboardStub.returns(Promise.reject());

      dispatchThen(fetchDashboard(), [REQUEST_DASHBOARD, RECEIVE_DASHBOARD_FAILURE]).then(dashboardState => {
        assert.equal(dashboardState.fetchStatus, FETCH_FAILURE);

        // assert that it returns a rejected promise on failure
        store.dispatch(fetchDashboard()).catch(() => {
          done();
        });
      });
    });
  });
});
