import React from 'react';
import { mount } from 'enzyme';
import { assert } from 'chai';
import sinon from 'sinon';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import R from 'ramda';
import TestUtils from 'react-addons-test-utils';

import { INITIAL_EMAIL_STATE, NEW_EMAIL_EDIT } from '../reducers/email';
import { modifyTextField } from '../util/test_utils';

import EmailCompositionDialog from './EmailCompositionDialog';

describe('EmailCompositionDialog', () => {
  let updateStub = sinon.stub();

  let defaultProps = {
    closeEmailDialog: sinon.stub().returns(updateStub),
    updateEmailEdit: sinon.stub().returns(updateStub),
    open: true,
    email: {
      ...INITIAL_EMAIL_STATE,
      email: NEW_EMAIL_EDIT
    },
    searchkit: {
      getHitsCount: sinon.stub().returns(20)
    },
    sendEmail: sinon.stub(),
  };

  const getDialog = () => document.querySelector('.email-composition-dialog');

  const renderDialog = (props = defaultProps) => (
    mount (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <EmailCompositionDialog {...props} />
      </MuiThemeProvider>
    )
  );

  it('should have a title', () => {
    renderDialog();
    assert.equal(document.querySelector('h3').textContent, 'New Email');
  });

  it('should have a results count', () => {
    renderDialog();
    let count = document.querySelector('.user-count').textContent;
    assert.equal(count, '20 recipients selected');
    assert(
      defaultProps.searchkit.getHitsCount.called,
      "called searchkit getHitsCount method"
    );
  });

  it('should fire sendSearchResultMail when the "send" button is clicked', () => {
    renderDialog();
    TestUtils.Simulate.click(getDialog().querySelector('.save-button'));
    assert(defaultProps.sendEmail.called, "called sendSearchResultMail method");
  });

  ['subject', 'body'].forEach(field => {
    describe(`editing ${field}`, () => {
      let getField = () => document.querySelector(`.email-${field}`);

      it('should show placeholder text if the store value is empty', () => {
        renderDialog();
        assert.notEqual(getField().placeholder, "");
      });

      it('should display the value from the store', () => {
        let newProps = R.clone(defaultProps);
        newProps.email.email[field] = "a field value!";
        renderDialog(newProps);
        assert.equal(getField().value, "a field value!");
      });

      it('should fire the updateEmailEdit callback on change', () => {
        renderDialog();
        let field = getField();
        modifyTextField(field, "HI");
        assert(updateStub.called, "onChange callback was called");
      });

      it('should show an error if an error for the field is passed in', () => {
        let props = R.clone(defaultProps);
        let validationErrors = props.email.validationErrors;
        let errorMessage = `An error message for ${field}`;
        validationErrors[field] = errorMessage;
        renderDialog(props);
        let message = getDialog().querySelector('.validation-error').textContent;
        assert.equal(message, errorMessage);
      });
    });
  });
});
