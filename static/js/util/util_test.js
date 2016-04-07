import assert from 'assert';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import striptags from 'striptags';

import {
  STATUS_NOT_OFFERED,
  STATUS_NOT_PASSED,
  STATUS_PASSED,
  STATUS_ENROLLED_NOT_VERIFIED,
  STATUS_OFFERED_NOT_ENROLLED,
  STATUS_VERIFIED_NOT_COMPLETED,
} from '../constants';
import { makeCourseStatusDisplay } from '../util/util';

/* eslint-disable camelcase */
describe('utility functions', () => {
  describe("makeCourseStatusDisplay", () => {
    let yesterday = '2016-03-30';
    let today = '2016-03-31';
    let tomorrow = '2016-04-01';

    /**
     * Returns the string with any HTML rendered and then its tags stripped
     * @return {String} rendered text stripped of HTML
     */
    let renderCourseStatusDisplay = (...args) => {
      let textOrElement = makeCourseStatusDisplay(...args);
      if (React.isValidElement(textOrElement)) {
        let container = document.createElement("div");
        ReactDOM.render(textOrElement, container);
        return striptags(container.innerHTML);
      } else {
        return textOrElement;
      }
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
});
