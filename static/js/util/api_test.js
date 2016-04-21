import assert from 'assert';
import fetchMock from 'fetch-mock/src/server';
import {
  getCourseList,
  getProgramList,
  getUserProfile,
  patchUserProfile,
  getDashboard,
} from './api';
import {
  COURSE_LIST_RESPONSE,
  PROGRAM_LIST_RESPONSE,
  USER_PROFILE_RESPONSE,
  DASHBOARD_RESPONSE,
} from '../constants';

describe('common api functions', function() {
  this.timeout(5000);  // eslint-disable-line no-invalid-this

  it('gets a list of courses', done => {
    fetchMock.mock('/api/v0/courses/', COURSE_LIST_RESPONSE);
    getCourseList().then(receivedCourseList => {
      assert.deepEqual(receivedCourseList, COURSE_LIST_RESPONSE);
      done();
    });
  });

  it('fails to get a list of courses', done => {
    fetchMock.mock('/api/v0/courses/', () => {
      return {
        status: 400
      };
    });

    getCourseList().catch(() => {
      done();
    });
  });

  it('gets user profile', done => {
    fetchMock.mock('/api/v0/profiles/jane/', USER_PROFILE_RESPONSE);
    getUserProfile('jane').then(receivedUserProfile => {
      assert.deepEqual(receivedUserProfile, USER_PROFILE_RESPONSE);
      done();
    });
  });

  it('fails to get user profile', done => {
    fetchMock.mock('/api/v0/profiles/jane/', () => {
      return {
        status: 400
      };
    });

    getUserProfile('jane').catch(() => {
      done();
    });
  });

  it('patches a user profile', done => {
    fetchMock.mock('/api/v0/profiles/jane/', (url, opts) => {
      assert.deepEqual(JSON.parse(opts.body), USER_PROFILE_RESPONSE);
      return { status: 200 };
    });
    patchUserProfile('jane', USER_PROFILE_RESPONSE).then(() => {
      done();
    });
  });

  it('fails to patch a user profile', done => {
    fetchMock.mock('/api/v0/profiles/jane/', (url, opts) => {
      assert.deepEqual(JSON.parse(opts.body), USER_PROFILE_RESPONSE);
      return { status: 400 };
    });
    patchUserProfile('jane', USER_PROFILE_RESPONSE).catch(() => {
      done();
    });
  });

  it('gets a list of programs', done => {
    fetchMock.mock('/api/v0/programs/', PROGRAM_LIST_RESPONSE);
    getProgramList().then(receivedProgramList => {
      assert.deepEqual(receivedProgramList, PROGRAM_LIST_RESPONSE);
      done();
    });
  });

  it('fails to get a list of programs', done => {
    fetchMock.mock('/api/v0/programs/', () => {
      return {
        status: 400
      };
    });

    getProgramList().catch(() => {
      done();
    });
  });

  it('gets the dashboard', done => {
    fetchMock.mock('/api/v0/dashboard/', DASHBOARD_RESPONSE);
    getDashboard().then(dashboard => {
      assert.deepEqual(dashboard, DASHBOARD_RESPONSE);
      done();
    });
  });

  it('fails to get the dashboard', done => {
    fetchMock.mock('/api/v0/dashboard/', () => ({
      status: 400
    }));

    getProgramList().catch(() => {
      done();
    });
  });

  afterEach(function() {
    fetchMock.restore();
  });
});
