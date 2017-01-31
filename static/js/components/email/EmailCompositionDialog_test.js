import React from 'react';
import { mount } from 'enzyme';
import { assert } from 'chai';
import sinon from 'sinon';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import TestUtils from 'react-addons-test-utils';

import * as inputUtil from '../inputs/util';
import { FETCH_PROCESSING } from '../../actions';
import {
  INITIAL_EMAIL_STATE
} from '../../reducers/email';
import { modifyTextField } from '../../util/test_utils';
import EmailCompositionDialog from './EmailCompositionDialog';

describe('EmailCompositionDialog', () => {
  let sandbox, updateStub, closeEmailDialog, updateEmailEdit, sendEmail;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    updateStub = sandbox.stub();
    closeEmailDialog = sandbox.stub().returns(updateStub);
    updateEmailEdit = sandbox.stub().returns(updateStub);
    sendEmail = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  const getDialog = () => document.querySelector('.email-composition-dialog');

  const renderDialog = (props = {}, subHeading = null) => (
    mount (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <EmailCompositionDialog
          closeEmailDialog={closeEmailDialog}
          updateEmailEdit={updateEmailEdit}
          open={true}
          email={{ ...INITIAL_EMAIL_STATE }}
          sendEmail={sendEmail}
          {...props}
        >
          { subHeading }
        </EmailCompositionDialog>
      </MuiThemeProvider>
    )
  );

  it('should have a title', () => {
    renderDialog();
    assert.equal(document.querySelector('h3').textContent, 'New Email');
  });

  it('should fire the send handler when the "send" button is clicked', () => {
    renderDialog();
    TestUtils.Simulate.click(getDialog().querySelector('.save-button'));
    assert.isTrue(sendEmail.called, "called send handler");
  });

  it('should show a disabled spinner button if email send is in progress', () => {
    let dialogActionsSpy = sandbox.spy(inputUtil, 'dialogActions');
    renderDialog({
      email: {
        ...INITIAL_EMAIL_STATE,
        fetchStatus: FETCH_PROCESSING,
      }
    });

    // assert that inFlight is true
    assert.isTrue(dialogActionsSpy.calledWith(sinon.match.any, sinon.match.any, true));
    assert.equal(dialogActionsSpy.callCount, 1);
  });

  it('should show a subheader when text is passed in', () => {
    renderDialog({}, 'Some subheader text');
    assert.equal(document.querySelector('h5').textContent, 'Some subheader text');
  });

  it('should not show a subheader when text is not passed in', () => {
    renderDialog({}, null);
    assert.isNull(document.querySelector('h5'));
  });

  it('should show a specific title when one is passed in', () => {
    renderDialog({title: 'Some Title'});
    assert.equal(document.querySelector('h3').textContent, 'Some Title');
  });

  it('should show a default title when one is not passed in', () => {
    renderDialog();
    assert.equal(document.querySelector('h3').textContent, 'New Email');
  });

  ['subject', 'body'].forEach(field => {
    describe(`editing ${field}`, () => {
      let getField = () => document.querySelector(`.email-${field}`);

      it('should show placeholder text if the store value is empty', () => {
        renderDialog();
        assert.notEqual(getField().placeholder, "");
      });

      it('should display the value from the store', () => {
        renderDialog({
          email: {
            ...INITIAL_EMAIL_STATE,
            inputs: {
              [field]: `${field} value!`
            }
          }
        });
        assert.equal(getField().value, `${field} value!`);
      });

      it('should fire the updateEmailEdit callback on change', () => {
        renderDialog();
        let field = getField();
        modifyTextField(field, "HI");
        assert(updateStub.calledWith(), "onChange callback was called");
      });

      it('should show an error if an error for the field is passed in', () => {
        let errorMessage = `An error message for ${field}`;
        renderDialog({
          email: {
            ...INITIAL_EMAIL_STATE,
            validationErrors: {
              [field]: errorMessage
            }
          }
        });
        let message = getDialog().querySelector('.validation-error').textContent;
        assert.equal(message, errorMessage);
      });
    });
  });
});
