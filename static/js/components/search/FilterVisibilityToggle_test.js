/* global SETTINGS: false */
import React from 'react';
import { assert } from 'chai';
import sinon from 'sinon';
import TestUtils from 'react-addons-test-utils';

import FilterVisibilityToggle from './FilterVisibilityToggle';
import { makeStrippedHtml } from '../../util/util';

describe('FilterVisibilityToggle', () => {
  let renderToggle = (props, children = undefined) => {
    if ( children === undefined) {
      return makeStrippedHtml(<FilterVisibilityToggle {...props} />);
    } else {
      return makeStrippedHtml(
        <FilterVisibilityToggle {...props}>
          { children }
        </FilterVisibilityToggle>
      );
    }
  };

  let checkFilterVisibility = sinon.stub().returns(true);
  let setFilterVisibility = sinon.stub();
  let filterName = 'a filter';

  let props;
  beforeEach(() => {
    props = {
      checkFilterVisibility:  checkFilterVisibility,
      setFilterVisibility:    setFilterVisibility,
      filterName:             filterName,
    };
  });

  it('renders children', () => {
    let toggle = renderToggle(props, <div>Test Text</div>);
    assert.include(toggle, "Test Text");
  });

  it('checks for filter visibility when rendering', () => {
    renderToggle(props, <div>Test Text</div>);
    assert(checkFilterVisibility.called);
  });

  it('sets filter visibility when clicked', () => {
    let componentTree = TestUtils.renderIntoDocument(
      <FilterVisibilityToggle {...props} />
    );
    let icon = TestUtils.findRenderedDOMComponentWithTag(
      componentTree, 'i'
    );
    TestUtils.Simulate.click(icon);
    assert(setFilterVisibility.called);
  });
});
