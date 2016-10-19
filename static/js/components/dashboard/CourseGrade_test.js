// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { assert } from 'chai';
import _ from 'lodash';

import CourseGrade from './CourseGrade';

import { findAndCloneCourse } from '../../util/test_utils';

describe('CourseGrade', () => {
  let gradeTypes = {
    current_grade: "Current grade",
    final_grade: "Final grade"
  };

  _.forEach(gradeTypes, function(expectedLabel: string, gradeKey: string) {
    it(`shows the ${expectedLabel} for a course`, () => {
      let course = findAndCloneCourse(course => course.runs.length > 0);
      let grade = '50';
      course.runs[0][gradeKey] = grade;

      const wrapper = shallow(<CourseGrade courseRun={course.runs[0]} />);
      assert.equal(wrapper.find(".course-grade .number").text(), `${grade}%`);
      assert.equal(wrapper.find(".course-grade .caption").text(), expectedLabel);
    });
  });
});
