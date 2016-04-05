/* global SETTINGS: false */
import {
  fetchCourseList,
  receiveCourseListSuccess,
  fetchUserProfile,
  receiveUserProfileSuccess,

  REQUEST_COURSE_LIST,
  RECEIVE_COURSE_LIST_SUCCESS,
  RECEIVE_COURSE_LIST_FAILURE,
  REQUEST_USER_PROFILE,
  RECEIVE_USER_PROFILE_SUCCESS,
  RECEIVE_USER_PROFILE_FAILURE,
  FETCH_FAILURE,
  FETCH_SUCCESS
} from '../actions/index';
import * as api from '../util/api';
import configureTestStore from 'redux-asserts';
import rootReducer, { INITIAL_USER_PROFILE_STATE } from '../reducers';
import assert from 'assert';
import sinon from 'sinon';

describe('reducers', () => {
  let sandbox, store, dispatchThen, courseListStub, userProfileStub;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    courseListStub = sandbox.stub(api, 'getCourseList');
    userProfileStub = sandbox.stub(api, 'getUserProfile');
    store = configureTestStore(rootReducer);
  });
  afterEach(() => {
    sandbox.restore();

    store = null;
    dispatchThen = null;
  });
  describe('course reducers', () => {
    beforeEach(() => {
      dispatchThen = store.createDispatchThen(state => state.courseList);
    });

    it('should have an empty default state', done => {
      dispatchThen({type: 'unknown'}, ['unknown']).then(state => {
        assert.deepEqual(state, {
          courseList: []
        });
        done();
      });
    });

    it('should fetch a list of courses successfully', done => {
      courseListStub.returns(Promise.resolve(["data"]));

      dispatchThen(fetchCourseList(), [REQUEST_COURSE_LIST, RECEIVE_COURSE_LIST_SUCCESS]).then(courseState => {
        assert.deepEqual(courseState.courseList, ["data"]);
        assert.equal(courseState.courseListStatus, FETCH_SUCCESS);

        done();
      });
    });

    it('should fail to fetch a list of courses', done => {
      courseListStub.returns(Promise.reject());

      dispatchThen(fetchCourseList(), [REQUEST_COURSE_LIST, RECEIVE_COURSE_LIST_FAILURE]).then(courseState => {
        assert.equal(courseState.courseListStatus, FETCH_FAILURE);

        done();
      });
    });
  });
  describe('profile reducers', () => {
    beforeEach(() => {
      dispatchThen = store.createDispatchThen(state => state.userProfile);
    });

    it('should have initial state', done => {
      dispatchThen({type: 'unknown'}, ['unknown']).then(state => {
        assert.deepEqual(state, INITIAL_USER_PROFILE_STATE);
        done();
      });
    });

    it('should fetch user profile successfully', done => {
      userProfileStub.returns(Promise.resolve(["data"]));

      dispatchThen(fetchUserProfile('jane'), [REQUEST_USER_PROFILE, RECEIVE_USER_PROFILE_SUCCESS]).
      then(profileState => {
        assert.deepEqual(profileState.profile, ["data"]);
        assert.equal(profileState.userProfileStatus, FETCH_SUCCESS);

        done();
      });
    });

    it('should fail to fetch user profile', done => {
      userProfileStub.returns(Promise.reject());

      dispatchThen(fetchUserProfile('jane'), [REQUEST_USER_PROFILE, RECEIVE_USER_PROFILE_FAILURE]).
      then(profileState => {
        assert.equal(profileState.userProfileStatus, FETCH_FAILURE);

        done();
      });
    });
  });

  describe('authentication reducers', () => {
    let dispatchThen;
    beforeEach(() => {
      dispatchThen = store.createDispatchThen(state => state.authentication);
    });

    it('should have default authentication state', done => {
      dispatchThen({type: 'unknown'}, ['unknown']).then(state => {
        assert.deepEqual(state, {
          name: SETTINGS.name,
          isAuthenticated: SETTINGS.isAuthenticated
        });
        done();
      });
    });
  });

});
