import {
  fetchCourseList,
  receiveCourseListSuccess,

  REQUEST_COURSE_LIST,
  RECEIVE_COURSE_LIST_SUCCESS,
  RECEIVE_COURSE_LIST_FAILURE,
  FETCH_FAILURE,
  FETCH_SUCCESS
} from '../actions/index';

import * as api from '../util/api';
import { COURSE_LIST_RESPONSE } from '../constants';
import configureTestStore from 'redux-asserts';
import rootReducer from '../reducers';
import assert from 'assert';
import sinon from 'sinon';

describe('reducers', () => {
  let sandbox, store, dispatchThen, courseListStub;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    courseListStub = sandbox.stub(api, 'getCourseList');
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

});
