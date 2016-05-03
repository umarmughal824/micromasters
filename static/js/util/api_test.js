import assert from 'assert';
import fetchMock from 'fetch-mock/src/server';
import {
  getUserProfile,
  patchUserProfile,
  getDashboard,
} from './api';
import {
  USER_PROFILE_RESPONSE,
  DASHBOARD_RESPONSE,
} from '../constants';

describe('common api functions', function() {
  this.timeout(5000);  // eslint-disable-line no-invalid-this

  it('gets user profile', done => {
    fetchMock.mock('/api/v0/profiles/jane/', USER_PROFILE_RESPONSE);
    getUserProfile('jane').then(receivedUserProfile => {
      assert.ok(fetchMock.called('/api/v0/profiles/jane/'));
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
      assert.ok(fetchMock.called('/api/v0/profiles/jane/'));
      done();
    });
  });

  it('patches a user profile', done => {
    fetchMock.mock('/api/v0/profiles/jane/', (url, opts) => {
      assert.deepEqual(JSON.parse(opts.body), USER_PROFILE_RESPONSE);
      return { status: 200 };
    });
    patchUserProfile('jane', USER_PROFILE_RESPONSE).then(() => {
      assert.ok(fetchMock.called('/api/v0/profiles/jane/'));
      done();
    });
  });

  it('fails to patch a user profile', done => {
    fetchMock.mock('/api/v0/profiles/jane/', (url, opts) => {
      assert.deepEqual(JSON.parse(opts.body), USER_PROFILE_RESPONSE);
      return { status: 400 };
    });
    patchUserProfile('jane', USER_PROFILE_RESPONSE).catch(() => {
      assert.ok(fetchMock.called('/api/v0/profiles/jane/'));
      done();
    });
  });

  it('gets the dashboard', done => {
    fetchMock.mock('/api/v0/dashboard/', DASHBOARD_RESPONSE);
    getDashboard().then(dashboard => {
      assert.ok(fetchMock.called('/api/v0/dashboard/'));
      assert.deepEqual(dashboard, DASHBOARD_RESPONSE);
      done();
    });
  });

  it('fails to get the dashboard', done => {
    fetchMock.mock('/api/v0/dashboard/', () => ({
      status: 400
    }));

    getDashboard().catch(() => {
      assert.ok(fetchMock.called('/api/v0/dashboard/'));
      done();
    });
  });

  afterEach(function() {
    fetchMock.restore();
  });
});
