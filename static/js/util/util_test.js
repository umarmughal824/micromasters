import assert from 'assert';
import moment from 'moment';
import React from 'react';

import {
  STATUS_NOT_OFFERED,
  STATUS_NOT_PASSED,
  STATUS_PASSED,
  STATUS_ENROLLED_NOT_VERIFIED,
  STATUS_OFFERED_NOT_ENROLLED,
  STATUS_VERIFIED_NOT_COMPLETED,
  USER_PROFILE_RESPONSE,
} from '../constants';
import {
  makeCourseStatusDisplay,
  makeCourseProgressDisplay,
  validateProfile,
  makeStrippedHtml,
} from '../util/util';

/* eslint-disable camelcase */
describe('utility functions', () => {
  describe('makeStrippedHtml', () => {
    it('strips HTML from a string', () => {
      assert.equal(makeStrippedHtml("<a href='x'>y</a>"), "y");
    });
    it('strips HTML from a react element', () => {
      assert.equal(makeStrippedHtml(<div><strong>text</strong></div>), "text");
    });
  });

  describe("makeCourseStatusDisplay", () => {
    let yesterday = '2016-03-30';
    let today = '2016-03-31';
    let tomorrow = '2016-04-01';

    let renderCourseStatusDisplay = (course, ...args) => {
      if (course.runs === undefined) {
        course.runs = [];
      }
      let textOrElement = makeCourseStatusDisplay(course, ...args);
      return makeStrippedHtml(textOrElement);
    };

    it('is a passed a course', () => {
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_PASSED,
        grade: 0.34
      }), "34%");
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_PASSED
      }), "");
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_PASSED,
        grade: null
      }), "");
    });

    it("is a failed course", () => {
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_NOT_PASSED,
        grade: 0.99999
      }), "100%");
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_NOT_PASSED
      }), "");
    });

    it("is a verified course without a course start date", () => {
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_VERIFIED_NOT_COMPLETED
      }), "");
    });

    it("is a verified course with a course start date of tomorrow", () => {
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_VERIFIED_NOT_COMPLETED,
        course_start_date: tomorrow
      }, moment(today)), "Course starting: 4/1/2016");
    });

    it("is a verified course with a course start date of today", () => {
      // Note the lack of grade field
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_VERIFIED_NOT_COMPLETED,
        course_start_date: today
      }, moment(today)), "0%");
    });

    it("is a verified course with a course start date of yesterday", () => {
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_VERIFIED_NOT_COMPLETED,
        course_start_date: yesterday,
        grade: 0.33333
      }, moment(today)), "33%");
    });

    it("is an enrolled course with no verification date", () => {
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_ENROLLED_NOT_VERIFIED
      }, moment(today)), "");
    });

    it("is an enrolled course with a verification date of tomorrow", () => {
      assert.equal(
        renderCourseStatusDisplay({
          status: STATUS_ENROLLED_NOT_VERIFIED,
          verification_date: tomorrow
        }, moment(today)),
        "UPGRADE TO VERIFIED"
      );
    });

    it("is an enrolled course with a verification date of today", () => {
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_ENROLLED_NOT_VERIFIED,
        verification_date: today
      }, moment(today)), "");
    });

    it("is an enrolled course with a verification date of yesterday", () => {
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_ENROLLED_NOT_VERIFIED,
        verification_date: yesterday
      }, moment(today)), "");
    });

    it("is an offered course with no enrollment start date", () => {
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_OFFERED_NOT_ENROLLED,
        fuzzy_enrollment_start_date: "fuzzy start date"
      }), "fuzzy start date");
    });

    it("is an offered course with an enrollment date of tomorrow", () => {
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_OFFERED_NOT_ENROLLED,
        enrollment_start_date: tomorrow
      }, moment(today)), "Enrollment starting: 4/1/2016");
    });

    it("is an offered course with an enrollment date of today", () => {
      assert.equal(
        renderCourseStatusDisplay({
          status: STATUS_OFFERED_NOT_ENROLLED,
          enrollment_start_date: today
        }, moment(today)),
        "ENROLL"
      );
    });

    it("is an offered course with an enrollment date of yesterday", () => {
      assert.equal(
        renderCourseStatusDisplay({
          status: STATUS_OFFERED_NOT_ENROLLED,
          enrollment_start_date: yesterday
        }, moment(today)),
        "ENROLL"
      );
    });

    it("is a run, not a course. If there are any runs the first run should be picked", () => {
      assert.equal(
        renderCourseStatusDisplay({
          status: STATUS_NOT_OFFERED,
          runs: [{
            status: STATUS_OFFERED_NOT_ENROLLED,
            enrollment_start_date: yesterday
          }]
        }, moment(today)),
        "ENROLL"
      );
    });

    it("is a not offered course", () => {
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_NOT_OFFERED
      }), "");
    });

    it("has a status we don't know about", () => {
      assert.equal(renderCourseStatusDisplay({
        status: "missing"
      }), "");
    });
  });

  describe("makeCourseStatusDisplay", () => {
    let renderCourseProgressDisplay = (course, ...args) => {
      if (course.runs === undefined) {
        course.runs = [];
      }
      let textOrElement = makeCourseProgressDisplay(course, ...args);
      return makeStrippedHtml(textOrElement);
    };

    it('is a course which is passed', () => {
      assert.equal(
        renderCourseProgressDisplay({
          status: STATUS_PASSED
        }),
        "Course passed"
      );
    });

    it('is a run which is passed. In this case the course status is ignored', () => {
      assert.equal(
        renderCourseProgressDisplay({
          status: STATUS_NOT_OFFERED,
          runs: [{
            status: STATUS_PASSED
          }]
        }),
        "Course passed"
      );
    });

    it('is a course which is in progress', () => {
      assert.equal(
        renderCourseProgressDisplay({
          status: STATUS_VERIFIED_NOT_COMPLETED
        }),
        "Course started"
      );
    });

    it('is a course which is not passed or in progress', () => {
      for (let status of [
        STATUS_NOT_PASSED,
        STATUS_ENROLLED_NOT_VERIFIED,
        STATUS_OFFERED_NOT_ENROLLED,
        STATUS_NOT_OFFERED,
      ]) {
        assert.equal(
          renderCourseProgressDisplay({
            status: status
          }),
          "Course not started"
        );
      }
    })
  });

  describe("validateProfile", () => {
    it('validates the test profile successfully', () => {
      let errors = validateProfile(USER_PROFILE_RESPONSE);
      assert.deepEqual(errors, {});
    });

    it('validates required fields', () => {
      let requiredFields = [
        'first_name',
        'last_name',
        'preferred_name',
        'gender',
        'preferred_language',
        'city',
        'country',
        'birth_city',
        'birth_country',
        'date_of_birth',
      ];

      let profile = {};
      for (let key of requiredFields) {
        profile[key] = '';
      }

      let errors = validateProfile(profile);
      for (let key of requiredFields) {
        let error = errors[key];
        assert.ok(error.indexOf("is required") !== -1);
      }
    });
  });
});
