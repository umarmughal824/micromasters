/* global SETTINGS: false */
import React from 'react';
import { shallow } from 'enzyme';
import { assert } from 'chai';
import sinon from 'sinon';
import urljoin from 'url-join';

import ProgressMessage from './ProgressMessage';
import Progress from './Progress';
import { makeCourse } from '../../../factories/dashboard';
import {
  makeRunCurrent,
  makeRunEnrolled,
  makeRunFuture,
} from './test_util';
import { EDX_LINK_BASE } from '../../../constants';
import { courseStartDateMessage } from './util';

describe('Course ProgressMessage', () => {
  let sandbox, openCourseContactDialogStub, course;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    openCourseContactDialogStub = sandbox.stub();
    course = makeCourse();
  });

  let renderCourseDescription = courseRun => shallow(
    <ProgressMessage
      courseRun={courseRun}
      course={course}
      openCourseContactDialog={openCourseContactDialogStub}
    />
  );

  it('displays information for an in-progress course run', () => {
    makeRunCurrent(course.runs[0]);
    let wrapper = renderCourseDescription(course.runs[0]);
    assert.equal(wrapper.find(".details").text(), "Course in progress");
  });

  it('displays a contact link, if appropriate, and a view on edX link', () => {
    makeRunEnrolled(course.runs[0]);
    makeRunCurrent(course.runs[0]);
    course.has_contact_email = true;
    let wrapper = renderCourseDescription(course.runs[0]);
    let [edxLink, contactLink] = wrapper.find('a');
    assert.equal(edxLink.props.href, urljoin(EDX_LINK_BASE, course.runs[0].course_id));
    assert.equal(edxLink.props.target, '_blank');
    assert.equal(edxLink.props.children, "View on edX");
    assert.equal(contactLink.props.onClick, openCourseContactDialogStub);
    assert.equal(contactLink.props.children, "Contact Course Team");
  });

  it('does not display a view on edX link, if there no course key', () => {
    course.runs[0].course_id = undefined;
    let wrapper = renderCourseDescription(course.runs[0]);
    assert.equal(wrapper.find('a').length, 0);
  });

  it('displays information for a future course run', () => {
    makeRunFuture(course.runs[0]);
    let wrapper = renderCourseDescription(course.runs[0]);
    assert.include(wrapper.text(), courseStartDateMessage(course.runs[0]));
  });

  it('includes the <Progress /> component', () => {
    let wrapper = renderCourseDescription(course.runs[0]);
    assert.lengthOf(wrapper.find(Progress), 1);
  });
});
