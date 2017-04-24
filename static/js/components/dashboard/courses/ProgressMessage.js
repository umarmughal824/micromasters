// @flow
/* global SETTINGS: false */
import React from 'react';
import R from 'ramda';
import _ from 'lodash';
import moment from 'moment';
import urljoin from 'url-join';

import type { CourseRun, Course } from '../../../flow/programTypes';
import {
  STATUS_PASSED,
  STATUS_NOT_PASSED,
  STATUS_CAN_UPGRADE,
  STATUS_MISSED_DEADLINE,
  STATUS_CURRENTLY_ENROLLED,
  EDX_LINK_BASE,
} from '../../../constants';
import { renderSeparatedComponents } from '../../../util/util';
import { hasAnyStaffRole } from '../../../lib/roles';
import Progress from './Progress';
import { courseStartDateMessage, courseCurrentlyInProgress } from './util';

// ProgressMessage is ONLY displayed for users who are already enrolled

const courseHasStarted = (courseRun: CourseRun): boolean => (
  moment(courseRun.course_start_date).isBefore(moment())
);

const courseMessage = (courseRun: CourseRun) => {
  if (courseHasStarted(courseRun) && !courseCurrentlyInProgress(courseRun)) {
    return "";
  }
  return courseHasStarted(courseRun)
    ? "Course in progress"
    : courseStartDateMessage(courseRun);
};

export default class ProgressMessage extends React.Component {
  props: {
    course:                  Course,
    courseRun:               CourseRun,
    openCourseContactDialog: () => void,
  };

  isCurrentOrPastEnrolled = (courseRun: CourseRun): boolean => {
    if([STATUS_CURRENTLY_ENROLLED, STATUS_PASSED, STATUS_NOT_PASSED].includes(courseRun.status)) {
      return true;
    } else {
      if ([STATUS_CAN_UPGRADE, STATUS_MISSED_DEADLINE].includes(courseRun.status)) {
        let now = moment();
        return !_.isNil(courseRun.course_start_date) && moment(courseRun.course_start_date).isBefore(now);
      } else {
        return false;
      }
    }
  };

  renderViewCourseEdxLink = (): React$Element<*>|null => {
    const { courseRun } = this.props;
    if (!courseRun.course_id) {
      return null;
    }

    let url = this.isCurrentOrPastEnrolled(courseRun)
      ? urljoin(EDX_LINK_BASE, courseRun.course_id)
      : courseRun.enrollment_url;

    return url && !hasAnyStaffRole(SETTINGS.roles) 
      ? <a
        key={'view-edx-link'}
        className={'view-edx-link'}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        View on edX
      </a>
      : null;
  };

  renderCourseContactLink = (): React$Element<*>|null => {
    const { course, openCourseContactDialog } = this.props;
    return course.has_contact_email 
      ? <a key={'contact-link'} className={'contact-link'} onClick={openCourseContactDialog}>
          Contact Course Team
        </a>
      : null;
  };

  renderCourseLinks = (): React$Element<*>|null => {
    const { courseRun } = this.props;

    let courseLinks = R.reject(R.isNil, [
      this.renderViewCourseEdxLink(courseRun),
      this.renderCourseContactLink()
    ]);

    return courseLinks.length > 0 
      ? <div className="course-links">
          { renderSeparatedComponents(courseLinks, ' | ') }
        </div>
      : null;
  };

  render() {
    const { courseRun } = this.props;

    return (
      <div className="course-progress-message cols">
        <div className="details first-col">
          { courseMessage(courseRun) }
          { this.renderCourseLinks() }
        </div>
        <Progress courseRun={courseRun} className="second-col" />
      </div>
    );
  }
}
