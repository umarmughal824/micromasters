// @flow
/* global SETTINGS: false */
import React from 'react';
import { assert } from 'chai';
import sinon from 'sinon';
import TestUtils from 'react-addons-test-utils';

import CountryRefinementOption from './CountryRefinementOption';
import { makeStrippedHtml } from '../../util/util';

describe('CountryRefinementOption', () => {
  let renderCountryOption = props => (
    makeStrippedHtml(<CountryRefinementOption {...props} />)
  );

  let onClick = sinon.stub();
  let props = {
    label: 'AF',
    active: false,
    onClick: onClick,
    count: 42,
  };

  let renderFullCountryOption = props => (
    TestUtils.renderIntoDocument(<CountryRefinementOption {...props} />)
  );

  it('should render a country name, given a country code', () => {
    let option = renderCountryOption(props);
    assert.include(option, 'Afghanistan');
  });

  it('should display the result count for the option', () => {
    let option = renderCountryOption(props);
    assert.include(option, '42');
  });

  it('should bind an onClick handler', () => {
    let componentTree = renderFullCountryOption(props);
    let clickableDiv = TestUtils.findAllInRenderedTree(
      componentTree, () => true
    )[1];
    TestUtils.Simulate.click(clickableDiv);
    assert(onClick.called, "onClick handler wasn't called");
  });

});
