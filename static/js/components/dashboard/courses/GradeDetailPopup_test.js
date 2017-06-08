// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { assert } from 'chai';
import sinon from 'sinon';
import Icon from 'react-mdl/lib/Icon';

import GradeDetailPopup from './GradeDetailPopup';
import { makeCourse } from '../../../factories/dashboard';
import { makeRunPassed, makeRunFailed } from './test_util';

describe('GradeDetailPopup', () => {
  let sandbox, course, setShowGradeDetailDialogStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    course = makeCourse(0);
    setShowGradeDetailDialogStub = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  let renderDetailPopup = (visible = false) => (
    shallow(
      <GradeDetailPopup
        course={course}
        setShowGradeDetailDialog={setShowGradeDetailDialogStub}
        dialogVisibility={visible}
      />
    )
  );

  it('shows info for an audited course', () => {
    renderDetailPopup().find('.course-run-row').forEach((node, idx) => (
      assert.equal(node.text(), `${course.runs[idx].title}Audited`)
    ));
  });

  it('shows info for a passed course', () => {
    makeRunPassed(course.runs[0]);
    let wrapper = renderDetailPopup();
    assert.equal(
      wrapper.find('.course-run-row').first().text(),
      `${course.runs[0].title}Passed`
    );
  });

  it('shows a grade, if there is one', () => {
    course.runs[0].final_grade = 93;
    assert.include(
      renderDetailPopup().find('.course-run-row').first().text(),
      '93'
    );
  });

  it('shows info for a failed course', () => {
    makeRunFailed(course.runs[1]);
    assert.equal(
      renderDetailPopup().find('.course-run-row').at(1).text(),
      `${course.runs[1].title}Not passed`
    );
  });

  it('highlights the best grade', () => {
    course.runs[0].final_grade = 22;
    course.runs[1].final_grade = 82;
    let wrapper = renderDetailPopup();
    assert.equal(
      wrapper.find('.course-run-row').at(0).find(Icon).length,
      0
    );
    assert.equal(
      wrapper.find('.course-run-row').at(1).find(Icon).length,
      1
    );
  });

  it('includes helpful information', () => {
    let wrapper = renderDetailPopup();
    assert.equal(
      wrapper.find('.explanation').text(),
      "Only your best passing grade counts toward your final grade"
    );
  });
});
