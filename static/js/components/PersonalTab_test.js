import React from 'react';
import { mount } from 'enzyme';
import { assert } from 'chai';
import R from 'ramda';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import PersonalTab from './PersonalTab';
import { PROGRAMS } from '../constants';

describe("PersonalTab", () => {
  let renderPersonalTab = (selectedProgram = null, props = {}) => {
    return mount(
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <PersonalTab
          programs={PROGRAMS}
          ui={{selectedProgram: selectedProgram}}
          {...props}
        />
      </MuiThemeProvider>,
      {
        context: { router: {}},
        childContextTypes: { router: React.PropTypes.object }
      }
    );
  };

  it('should show a list of programs to enroll in for the learner page', () => {
    let wrapper = renderPersonalTab();
    let programOptions = wrapper.find(".program-select").find("Select").props().options;
    assert.equal(programOptions.length, PROGRAMS.length);
    let sortedEnrollments = R.sortBy(R.compose(R.toLower, R.prop('title')))(PROGRAMS);
    programOptions.forEach((menuItem, i) => {
      let program = sortedEnrollments[i];
      assert.equal(program.title, menuItem.label);
      assert.equal(program.id, menuItem.value);
    });
  });

  it('should have the current program enrollment selected', () => {
    let selectedProgram = PROGRAMS[0];
    let wrapper = renderPersonalTab(selectedProgram);
    let props = wrapper.find(".program-select").find("Select").props();
    assert.equal(props.value, selectedProgram.id);
  });
});
