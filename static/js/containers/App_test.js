/* global document: false, window: false */
import '../global_init';

import ReactDOM from 'react-dom';

import {
  CLEAR_COURSE_LIST,
  CLEAR_DASHBOARD,
  CLEAR_PROFILE,
} from '../actions';
import IntegrationTestHelper from '../util/integration_test_helper';

describe('App', () => {
  let listenForActions, renderComponent, helper;
  beforeEach(() => {
    helper = new IntegrationTestHelper();
    listenForActions = helper.listenForActions.bind(helper);
    renderComponent = helper.renderComponent.bind(helper);
  });

  afterEach(() => {
    helper.cleanup();
  });

  it('clears profile, dashboard and course list after unmounting', done => {
    renderComponent("/dashboard").then(([component, div]) => {  // eslint-disable-line no-unused-vars
      listenForActions([CLEAR_COURSE_LIST, CLEAR_DASHBOARD, CLEAR_PROFILE], () => {
        ReactDOM.unmountComponentAtNode(div);
      }).then(() => {
        done();
      });
    });
  });
});
