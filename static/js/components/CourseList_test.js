import React from 'react';
import TestUtils from 'react-addons-test-utils';
import sinon from 'sinon';
import assert from 'assert';
import _ from 'lodash';

import CourseList from './CourseList';
import * as util from '../util/util';
import { DASHBOARD_RESPONSE } from '../constants';

describe("CourseList", () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('renders courses using util functions', () => {
    let makeCourseProgressDisplaySpy = sandbox.spy(util, 'makeCourseProgressDisplay');
    let makeCourseStatusDisplaySpy = sandbox.spy(util, 'makeCourseStatusDisplay');

    TestUtils.renderIntoDocument(
      <CourseList dashboard={{programs: DASHBOARD_RESPONSE}} />
    );

    let callCount = 0;
    for (let program of DASHBOARD_RESPONSE) {
      let sortedCourses = _.sortBy(program.courses, 'position_in_program');
      let courseCount = 0;
      for (let course of sortedCourses) {
        let progressDisplayCall = makeCourseProgressDisplaySpy.getCall(callCount);
        let statusDisplayCall = makeCourseStatusDisplaySpy.getCall(callCount);
        callCount++;

        assert.deepEqual(course, progressDisplayCall.args[0]);
        assert.deepEqual(course, statusDisplayCall.args[0]);

        let isTop = courseCount === 0;
        let isBottom = courseCount === sortedCourses.length - 1;
        assert.equal(isTop, progressDisplayCall.args[1]);
        assert.equal(isBottom, progressDisplayCall.args[2]);

        courseCount++;
      }
    }
  });
});