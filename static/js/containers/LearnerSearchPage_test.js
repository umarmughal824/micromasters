/* global SETTINGS: false */
import { assert } from 'chai';
import _ from 'lodash';
import TestUtils from 'react-addons-test-utils';

import IntegrationTestHelper from '../util/integration_test_helper';
import {
  PROGRAMS,
  ELASTICSEARCH_RESPONSE,
} from '../test_constants';
import { setEmailDialogVisibility } from '../actions/ui';
import {
  INITIATE_SEND_EMAIL,
  SEND_EMAIL_SUCCESS,
  UPDATE_EMAIL_VALIDATION,
  UPDATE_EMAIL_EDIT,
  CLEAR_EMAIL_EDIT,
  startEmailEdit,
} from '../actions/email';
import {
  SET_EMAIL_DIALOG_VISIBILITY,
} from '../actions/ui';
import { SEARCH_EMAIL_TYPE } from '../components/email/constants';
import * as api from '../lib/api';
import { modifyTextField } from '../util/test_utils';

describe('LearnerSearchPage', function () {
  let renderComponent, listenForActions, helper, server;

  beforeEach(() => {
    helper = new IntegrationTestHelper();
    renderComponent = helper.renderComponent.bind(helper);
    listenForActions = helper.listenForActions.bind(helper);
    server = helper.sandbox.useFakeServer();
    server.respondWith("POST", "http://localhost:9200/_search", [
      200, { "Content-Type": "application/json" }, JSON.stringify(ELASTICSEARCH_RESPONSE)
    ]);
  });

  afterEach(() => {
    helper.cleanup();
  });

  it('calls the elasticsearch API', () => {
    assert(_.isEmpty(server.requests));
    return renderComponent('/learners').then(() => {
      assert(!_.isEmpty(server.requests));
      let request = server.requests[0];
      assert.deepEqual(request.url, "/_search");
      assert.deepEqual(request.method, "POST");
    });
  });

  it('filters by program id for current enrollment', () => {
    return renderComponent('/learners').then(() => {
      let request = server.requests[server.requests.length - 1];
      let body = JSON.parse(request.requestBody);
      assert.deepEqual(body.filter.bool.must[0].term['program.id'], PROGRAMS[0].id);
    });
  });

  it("doesn't filter by program id for current enrollment if it's not set to anything", () => {
    helper.programsGetStub.returns(Promise.resolve([]));

    return renderComponent('/learners').then(() => {
      assert.lengthOf(server.requests, 0);
    });
  });

  it('waits for a successful email send to close the dialog', () => {
    let searchKitStub = {
      buildQuery: () => ({query: {abc: 123}})
    };
    helper.programsGetStub.returns(Promise.resolve(PROGRAMS));
    helper.store.dispatch(
      startEmailEdit({
        type: SEARCH_EMAIL_TYPE,
        params: {
          searchkit: searchKitStub
        }
      })
    );
    helper.store.dispatch(setEmailDialogVisibility(true));
    let sendSearchResultMail = helper.sandbox.stub(api, 'sendSearchResultMail');
    sendSearchResultMail.returns(Promise.resolve());

    return renderComponent('/learners').then(() => {
      let dialog = document.querySelector('.email-composition-dialog');
      let saveButton = dialog.querySelector('.save-button');

      return listenForActions([
        UPDATE_EMAIL_EDIT,
        UPDATE_EMAIL_EDIT,
        UPDATE_EMAIL_VALIDATION,
        INITIATE_SEND_EMAIL,
        SEND_EMAIL_SUCCESS,
        CLEAR_EMAIL_EDIT,
        SET_EMAIL_DIALOG_VISIBILITY,
      ], () => {
        modifyTextField(dialog.querySelector('.email-subject'), 'subject');
        modifyTextField(dialog.querySelector('.email-body'), 'body');

        assert.isTrue(helper.store.getState().ui.emailDialogVisibility);
        TestUtils.Simulate.click(saveButton);
      }).then(() => {
        assert.isFalse(helper.store.getState().ui.emailDialogVisibility);
        assert.isTrue(sendSearchResultMail.calledWith("subject", "body", {abc: 123}));
      });
    });
  });
});
