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

describe('StaffLearnerInfoCard', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    SETTINGS.roles.push({ role: 'staff' });
  });

  afterEach(() => {
    sandbox.restore();
  });

  let renderCard = () => (
    mount(
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <StaffLearnerInfoCard
          program={DASHBOARD_RESPONSE[0]}
        />
      </MuiThemeProvider>
    )
  );

  it('should have the program title', () => {
    let card = renderCard();
    assert.include(
      stringStrip(card.text()),
      `Progress ${DASHBOARD_RESPONSE[0].title}`
    );
  });

  it('should render the progress display', () => {
    let card = renderCard();
    assert.include(
      stringStrip(card.text()),
      "1 4 Courses complete"
    );
  });
});
