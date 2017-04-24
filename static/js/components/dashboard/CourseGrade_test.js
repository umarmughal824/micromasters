// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { assert } from 'chai';
import _ from 'lodash';

import { EDX_LINK_BASE } from '../../constants';
import CourseGrade from './CourseGrade';
import { makeProctoredExamResult } from '../../factories/dashboard';

import { findAndCloneCourse } from '../../util/test_utils';

describe('CourseGrade', () => {
  let gradeTypes = {
    current_grade: "edX Progress",
    final_grade: "edX grade"
  };

  _.forEach(gradeTypes, function(expectedLabel: string, gradeKey: string) {
    it(`shows the ${expectedLabel} for a course`, () => {
      let course = findAndCloneCourse(course => (
        course !== null && course !== undefined && course.runs.length > 0
      ));
      let grade = '50';
      let progressUrl = `${EDX_LINK_BASE}${course.runs[0].course_id}/progress`;
      course.runs[0][gradeKey] = grade;

      const wrapper = shallow(<CourseGrade courseRun={course.runs[0]} />);
      let gradeView = wrapper.find(".course-grade .number").childAt(0);
      assert.equal(gradeView.props().href, progressUrl);
      assert.equal(gradeView.props().target, "_blank");
      assert.equal(gradeView.text(), `${grade}%`);
      assert.equal(wrapper.find(".course-grade .caption").text(), expectedLabel);
    });
  });

  it('should show exam grades, if it is passed a course', () => {
    let course = findAndCloneCourse(course => (
      course !== null && course !== undefined && course.runs.length > 0
    ));
    let grade = 50;
    course.runs[0].current_grade = grade;
    let examGrade = makeProctoredExamResult();
    course.proctorate_exams_grades = [examGrade];
    const wrapper = shallow(<CourseGrade courseRun={course.runs[0]} course={course} />);

    assert.equal(
      wrapper.find(".course-grade .number").at(0).text(),
      `${_.round(examGrade.percentage_grade * 100)}%`
    );
    assert.equal(
      wrapper.find(".course-grade .caption").at(0).text(),
      'Exam Grade'
    );
  });

  it('should not show exam grades, if not passed a course', () => {
    let course = findAndCloneCourse(course => (
      course !== null && course !== undefined && course.runs.length > 0
    ));
    let grade = 50;
    course.runs[0].current_grade = grade;
    const wrapper = shallow(<CourseGrade courseRun={course.runs[0]} />);
    assert.equal(wrapper.find('.course-grade .number').length, 1);
    assert.equal(wrapper.find('.course-grade .caption').length, 1);
  });
});
