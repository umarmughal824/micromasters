import React from 'react';
import R from 'ramda';
import { mount } from 'enzyme';
import { assert } from 'chai';
import sinon from 'sinon';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import IntegrationTestHelper from '../../util/integration_test_helper';
import { withEmailDialog } from './hoc';
import { EMAIL_COMPOSITION_DIALOG } from './constants';
import { START_EMAIL_EDIT } from '../../actions/email';
import { SHOW_DIALOG } from '../../actions/ui';
import {
  TEST_EMAIL_TYPE,
  TEST_EMAIL_CONFIG,
  INITIAL_TEST_EMAIL_STATE
} from './test_constants';

describe('Email higher-order component', () => {
  let helper, listenForActions, openEmailSpy;

  class TestContainerPage extends React.Component {
    render () {
      let { openEmailComposer } = this.props;

      return <div>
        <button onClick={openEmailComposer(TEST_EMAIL_TYPE)}>Open Email</button>
      </div>;
    }
  }

  const WrappedTestContainerPage = R.compose(
    withEmailDialog({
      [TEST_EMAIL_TYPE]: TEST_EMAIL_CONFIG
    })
  )(TestContainerPage);

  beforeEach(() => {
    helper = new IntegrationTestHelper();
    listenForActions = helper.listenForActions.bind(helper);
    openEmailSpy = sinon.spy(TEST_EMAIL_CONFIG, 'emailOpenParams');
  });

  afterEach(() => {
    TEST_EMAIL_CONFIG.emailOpenParams.restore();
    helper.cleanup();
  });

  let renderTestComponentWithDialog = () => (
    mount(
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <WrappedTestContainerPage
          dispatch={helper.store.dispatch}
          ui={{dialogVisibility: {[EMAIL_COMPOSITION_DIALOG]: false}}}
          email={INITIAL_TEST_EMAIL_STATE}
        />
      </MuiThemeProvider>
    )
  );

  it('should render an email dialog when the wrapped component renders', () => {
    let wrapper = renderTestComponentWithDialog();
    assert.isOk(wrapper.find('EmailCompositionDialog'));
  });

  it('should expose a function that lets the wrapped component launch the email dialog', () => {
    let wrapper = renderTestComponentWithDialog();
    assert.isFalse(openEmailSpy.called);
    return listenForActions([START_EMAIL_EDIT, SHOW_DIALOG], () => {
      wrapper.find('button').simulate('click');
    }).then(() => {
      assert.isTrue(openEmailSpy.called);
    });
  });
});
