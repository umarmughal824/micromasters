import React from 'react';
import ga from 'react-ga';
import moment from 'moment';
import Button from 'react-bootstrap/lib/Button';

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
  switch (course.status) {
  case STATUS_PASSED:
  case STATUS_NOT_PASSED:
    return <span className="course-list-grade">
      {asPercent(course.grade)}
    </span>;

  case STATUS_VERIFIED_NOT_COMPLETED: {
    if (!course.course_start_date) {
      // Invalid case, API should always send a valid course start date
      return "";
    }

    let courseStartDate = moment(course.course_start_date);
    if (courseStartDate.isAfter(now, 'day')) {
      return "Course starting: " + courseStartDate.format("M/D/Y");
    }

    let grade = course.grade;
    if (grade === undefined || grade === null) {
      // Grade defaults to 0%
      grade = 0;
    }
    return <span className="course-list-grade">
      {asPercent(grade)}
    </span>;
  }
  case STATUS_ENROLLED_NOT_VERIFIED: {
    if (!course.verification_date) {
      // Invalid case, API should always send a valid verification date
      return "";
    }

    let verificationDate = moment(course.verification_date);
    if (verificationDate.isAfter(now, 'day')) {
      return <Button bsStyle="success">UPGRADE TO VERIFIED</Button>;
    } else {
      // User cannot verify anymore
      return "";
    }
  }
  case STATUS_OFFERED_NOT_ENROLLED: {
    if (!course.enrollment_start_date) {
      return course.fuzzy_enrollment_start_date;
    }

    let enrollmentDate = moment(course.enrollment_start_date);
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

/* eslint-disable camelcase */
/**
 * Validates the profile
 *
 * @param {Object} profile The user profile
 * @returns {Object} Validation errors or an empty object if no errors
 */
export function validateProfile(profile) {
  let errors = {};

  let required = {
    'first_name': "Given name",
    'last_name': "Family name",
    'preferred_name': "Preferred name",
    'gender': "Gender",
    'preferred_language': "Preferred language",
    'city': "City",
    'country': "Country",
    'birth_city': 'City',
    'birth_country': "Country",
    'date_of_birth': "Date of birth"
  };

  for (let key of Object.keys(required)) {
    if (!profile[key]) {
      errors[key] = `${required[key]} is required`;
    }
  }

  return errors;
}
/* eslint-enable camelcase */
