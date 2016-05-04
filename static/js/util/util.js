import React from 'react';
import ReactDOM from 'react-dom';
import ga from 'react-ga';
import moment from 'moment';
import Button from 'react-bootstrap/lib/Button';
import striptags from 'striptags';
import _ from 'lodash';

import {
  STATUS_PASSED,
  STATUS_NOT_PASSED,
  STATUS_VERIFIED_NOT_COMPLETED,
  STATUS_ENROLLED_NOT_VERIFIED,
  STATUS_OFFERED_NOT_ENROLLED,
} from '../constants';

export function sendGoogleAnalyticsEvent(category, action, label, value) {
  let event = {
    category: category,
    action: action,
    label: label,
  };
  if (value !== undefined) {
    event.value = value;
  }
  ga.event(event);
}

function asPercent(number) {
  if (number === undefined || number === null) {
    return "";
  }
  return Math.round(number * 100) + "%";
}

/**
 * Determine React elements for the UI given a course status
 * @param {object} course A course coming from the dashboard
 * @param {moment} now The current time
 * @returns {ReactElement} Some React element or string to display for course status
 */
export function makeCourseStatusDisplay(course, now = moment()) {
  let courseOrRun = course;
  if (course.runs.length > 0) {
    courseOrRun = course.runs[0];
  }

  switch (courseOrRun.status) {
  case STATUS_PASSED:
  case STATUS_NOT_PASSED:
    return <span className="course-list-grade">
      {asPercent(courseOrRun.grade)}
    </span>;

  case STATUS_VERIFIED_NOT_COMPLETED: {
    if (!courseOrRun.course_start_date) {
      // Invalid case, API should always send a valid course start date
      return "";
    }

    let courseStartDate = moment(courseOrRun.course_start_date);
    if (courseStartDate.isAfter(now, 'day')) {
      return "Course starting: " + courseStartDate.format("M/D/Y");
    }

    let grade = courseOrRun.grade;
    if (grade === undefined || grade === null) {
      // Grade defaults to 0%
      grade = 0;
    }
    return <span className="course-list-grade">
      {asPercent(grade)}
    </span>;
  }
  case STATUS_ENROLLED_NOT_VERIFIED: {
    if (!courseOrRun.verification_date) {
      // Invalid case, API should always send a valid verification date
      return "";
    }

    let verificationDate = moment(courseOrRun.verification_date);
    if (verificationDate.isAfter(now, 'day')) {
      return <Button bsStyle="success">UPGRADE TO VERIFIED</Button>;
    } else {
      // User cannot verify anymore
      return "";
    }
  }
  case STATUS_OFFERED_NOT_ENROLLED: {
    if (!courseOrRun.enrollment_start_date) {
      return courseOrRun.fuzzy_enrollment_start_date;
    }

    let enrollmentDate = moment(courseOrRun.enrollment_start_date);
    if (enrollmentDate.isAfter(now, 'day')) {
      return "Enrollment starting: " + enrollmentDate.format("M/D/Y");
    } else {
      return <Button bsStyle="success">ENROLL</Button>;
    }
  }
  default:
    // also covers NOT_OFFERED case
    return "";
  }
}

/**
 * Determine progress React element for the UI given a course
 * @param {object} course A course coming from the dashboard
 * @param {bool} isFirst If false, draw a line up to the previous course
 * @param {bool} isLast If false, draw a line down to the next course
 * @returns {ReactElement} Some React element or string to display for course status
 */
export function makeCourseProgressDisplay(course, isFirst, isLast) {
  let courseOrRun = course;
  if (course.runs.length > 0) {
    courseOrRun = course.runs[0];
  }

  let height = 70, outerRadius = 10, innerRadius = 8, width = 30, color="#7fbaec";
  let centerX = width/2, centerY = height/2;

  let topLine;
  if (!isFirst) {
    topLine = <line
      x1={centerX}
      x2={centerX}
      y1={0}
      y2={centerY - outerRadius}
      stroke={color}
      strokeWidth={1}
    />;
  }
  let bottomLine;
  if (!isLast) {
    bottomLine = <line
      x1={centerX}
      x2={centerX}
      y1={centerY + outerRadius}
      y2={height}
      stroke={color}
      strokeWidth={1}
    />;
  }

  let alt = "Course not started";
  let innerElement;
  if (courseOrRun.status === STATUS_PASSED) {
    // full circle to indicate course passed
    alt = "Course passed";
    innerElement = <circle cx={centerX} cy={centerY} r={innerRadius} fill={color} />;
  } else if (courseOrRun.status === STATUS_VERIFIED_NOT_COMPLETED) {
    alt = "Course started";
    // semi circle on the left side
    // see path docs: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#Arcs
    let path = [
      "M", centerX, centerY - innerRadius,
      "A", innerRadius, innerRadius, 0, 0, 0, centerX, centerY + innerRadius
    ].join(" ");
    innerElement = <path
      d={path}
      fill={color}
    />;
  }

  return <svg style={{width: width, height: height}}>
    <desc>{alt}</desc>
    <circle cx={centerX} cy={centerY} r={outerRadius} stroke={color} fillOpacity={0} />
    {innerElement}
    {topLine}
    {bottomLine}
  </svg>;
}

/* eslint-disable camelcase */
/**
 * Validates the profile
 *
 * @param {Object} profile The user profile
 * @returns {Object} Validation errors or an empty object if no errors
 */
export function validateProfile(profile, requiredFields, messages) {
  let errors = {};
  for (let keySet of requiredFields) {
    let val = _.get(profile, keySet);
    if (_.isUndefined(val) || _.isNull(val) || val === "" ) {
      _.set(errors, keySet,  `${messages[keySet.slice(-1)[0]]} is required`);
    }
  }
  return errors;
}

/* eslint-enable camelcase */

/**
 * Returns the string with any HTML rendered and then its tags stripped
 * @return {String} rendered text stripped of HTML
 */
export function makeStrippedHtml(textOrElement) {
  if (React.isValidElement(textOrElement)) {
    let container = document.createElement("div");
    ReactDOM.render(textOrElement, container);
    return striptags(container.innerHTML);
  } else {
    return striptags(textOrElement);
  }
}
