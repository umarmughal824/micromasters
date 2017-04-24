// @flow
/* global SETTINGS: false */
import React from 'react';
import { mount } from 'enzyme';
import { assert } from 'chai';
import sinon from 'sinon';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import StaffLearnerInfoCard from './StaffLearnerInfoCard';
import { DASHBOARD_RESPONSE } from '../test_constants';
import { stringStrip } from '../util/test_utils';
import { STATUS_OFFERED } from '../constants';
import CourseDescription from '../components/dashboard/CourseDescription';
import Progress from '../components/dashboard/courses/Progress';

describe('StaffLearnerInfoCard', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    SETTINGS.roles.push({ role: 'staff' });
  });

  afterEach(() => {
    sandbox.restore();
  });

  let renderCard = (program = DASHBOARD_RESPONSE.programs[0]) => (
    mount(
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <StaffLearnerInfoCard
          program={program}
        />
      </MuiThemeProvider>
    )
  );

  it('should have the program title', () => {
    let card = renderCard();
    assert.include(
      stringStrip(card.text()),
      `Progress ${DASHBOARD_RESPONSE.programs[0].title}`
    );
  });

  it('should render the progress display', () => {
    let card = renderCard();
    assert.include(
      stringStrip(card.text()),
      "1 4 Courses complete"
    );
  });

  it('should show information for course runs the user is enrolled in', () => {
    let numRuns = DASHBOARD_RESPONSE.programs[0]
      .courses
      .reduce((acc, course) => acc.concat(course.runs), [])
      .filter(run => run.status !== STATUS_OFFERED)
      .length;

    let card = renderCard();
    assert.equal(card.find(CourseDescription).length, numRuns);
    assert.equal(card.find(Progress).length, numRuns);
  });

  it('should show average grade, if present', () => {
    let program = {...DASHBOARD_RESPONSE.programs[0]};
    program.grade_average = 62;
    let badge = renderCard(program)
      .find('.average-program-grade .program-badge');
    assert.equal(badge.text(), '62%');
  });

  it('should show "--" if the grade is not present', () => {
    let badge = renderCard().find('.average-program-grade .program-badge');
    assert.equal(badge.text(), '--');
  });
});
