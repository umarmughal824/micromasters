import assert from 'assert';
import fetchMock from 'fetch-mock/src/server';
import { getCourseList, getUserProfile} from './api';
import { COURSE_LIST_RESPONSE, USER_PROFILE_RESPONSE } from '../constants';

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
    fetchMock.mock('/api/v0/profiles/jane', USER_PROFILE_RESPONSE);
    getUserProfile('jane').then(receivedUserProfile => {
      assert.deepEqual(receivedUserProfile, USER_PROFILE_RESPONSE);
      done();
    });
  });

  it('fails to get user profile', done => {
    fetchMock.mock('/api/v0/profiles/jane', () => {
      return {
        status: 400
      };
    });

    getCourseList().catch(() => {
      done();
    });
  });

  afterEach(function() {
    fetchMock.restore();
  });
});
