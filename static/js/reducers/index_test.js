/* global SETTINGS: false */
import {

  fetchCourseList,
  receiveCourseListSuccess,
  clearCourseList,
  REQUEST_COURSE_LIST,
  RECEIVE_COURSE_LIST_SUCCESS,
  RECEIVE_COURSE_LIST_FAILURE,
  CLEAR_COURSE_LIST,

  fetchUserProfile,
  receiveUserProfileSuccess,
  clearProfile,
  REQUEST_USER_PROFILE,
  RECEIVE_USER_PROFILE_SUCCESS,
  RECEIVE_USER_PROFILE_FAILURE,
  CLEAR_PROFILE,

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
  COURSE_LIST_RESPONSE,
  PROGRAM_LIST_RESPONSE,
  DASHBOARD_RESPONSE,
} from '../constants';
import configureTestStore from 'redux-asserts';
import rootReducer, { INITIAL_USER_PROFILE_STATE } from '../reducers';
import assert from 'assert';
import sinon from 'sinon';

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

  describe('course reducers', () => {
    let courseListStub, programListStub;

    beforeEach(() => {
      dispatchThen = store.createDispatchThen(state => state.courseList);
      courseListStub = sandbox.stub(api, 'getCourseList');
      programListStub = sandbox.stub(api, 'getProgramList');
    });

    it('should have an empty default state', done => {
      dispatchThen({type: 'unknown'}, ['unknown']).then(state => {
        assert.deepEqual(state, {
          courseList: [],
          programList: []
        });
        done();
      });
    });

    it('should fetch a list of courses successfully then clear the course list', done => {
      courseListStub.returns(Promise.resolve(COURSE_LIST_RESPONSE));
      programListStub.returns(Promise.resolve(PROGRAM_LIST_RESPONSE));

      dispatchThen(fetchCourseList(), [REQUEST_COURSE_LIST, RECEIVE_COURSE_LIST_SUCCESS]).then(courseState => {
        assert.deepEqual(courseState.courseList, COURSE_LIST_RESPONSE);
        assert.deepEqual(courseState.programList, PROGRAM_LIST_RESPONSE);
        assert.equal(courseState.fetchStatus, FETCH_SUCCESS);

        dispatchThen(clearCourseList(), [CLEAR_COURSE_LIST]).then(courseState => {
          assert.deepEqual(courseState, {
            courseList: [],
            programList: []
          });

          done();
        });
      });
    });

    it("should fail to fetch a list of courses if we can't access the course API", done => {
      courseListStub.returns(Promise.reject());
      programListStub.returns(Promise.resolve(PROGRAM_LIST_RESPONSE));

      dispatchThen(fetchCourseList(), [REQUEST_COURSE_LIST, RECEIVE_COURSE_LIST_FAILURE]).then(courseState => {
        assert.equal(courseState.fetchStatus, FETCH_FAILURE);

        done();
      });
    });

    it("should fail to fetch a list of courses if we can't access the program API", done => {
      courseListStub.returns(Promise.reject(COURSE_LIST_RESPONSE));
      programListStub.returns(Promise.reject());

      dispatchThen(fetchCourseList(), [REQUEST_COURSE_LIST, RECEIVE_COURSE_LIST_FAILURE]).then(courseState => {
        assert.equal(courseState.fetchStatus, FETCH_FAILURE);

        done();
      });
    });
  });
  describe('profile reducers', () => {
    let userProfileStub;
    beforeEach(() => {
      dispatchThen = store.createDispatchThen(state => state.userProfile);
      userProfileStub = sandbox.stub(api, 'getUserProfile');
    });

    it('should have initial state', done => {
      dispatchThen({type: 'unknown'}, ['unknown']).then(state => {
        assert.deepEqual(state, INITIAL_USER_PROFILE_STATE);
        done();
      });
    });

    it('should fetch user profile successfully then clear it', done => {
      userProfileStub.returns(Promise.resolve(["data"]));

      dispatchThen(fetchUserProfile('jane'), [REQUEST_USER_PROFILE, RECEIVE_USER_PROFILE_SUCCESS]).
      then(profileState => {
        assert.deepEqual(profileState.profile, ["data"]);
        assert.equal(profileState.userProfileStatus, FETCH_SUCCESS);

        dispatchThen(clearProfile(), [CLEAR_PROFILE]).then(state => {
          assert.deepEqual(state, INITIAL_USER_PROFILE_STATE);

          done();
        });
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

  describe('dashboard reducers', () => {
    let dashboardStub;

    beforeEach(() => {
      dispatchThen = store.createDispatchThen(state => state.dashboard);
      dashboardStub = sandbox.stub(api, 'getDashboard');
    });

    it('should have an empty default state', done => {
      dispatchThen({type: 'unknown'}, ['unknown']).then(state => {
        assert.deepEqual(state, {
          courses: []
        });
        done();
      });
    });

    it('should fetch the dashboard successfully then clear it', done => {
      dashboardStub.returns(Promise.resolve(DASHBOARD_RESPONSE));

      dispatchThen(fetchDashboard(), [REQUEST_DASHBOARD, RECEIVE_DASHBOARD_SUCCESS]).then(dashboardState => {
        assert.deepEqual(dashboardState.courses, DASHBOARD_RESPONSE.courses);
        assert.equal(dashboardState.fetchStatus, FETCH_SUCCESS);

        dispatchThen(clearDashboard(), [CLEAR_DASHBOARD]).then(dashboardState => {
          assert.deepEqual(dashboardState, {
            courses: []
          });

          done();
        });
      });
    });

    it('should fail to fetch the dashboard', done => {
      dashboardStub.returns(Promise.reject());

      dispatchThen(fetchDashboard(), [REQUEST_DASHBOARD, RECEIVE_DASHBOARD_FAILURE]).then(dashboardState => {
        assert.equal(dashboardState.fetchStatus, FETCH_FAILURE);

        done();
      });
    });
  });
});
