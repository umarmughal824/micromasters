import React from 'react';
import R from 'ramda';
import _ from 'lodash';
import { mount } from 'enzyme';
import { assert } from 'chai';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import IntegrationTestHelper from '../../util/integration_test_helper';
import { USER_PROFILE_RESPONSE } from '../../test_constants';
import { withEmailDialog } from './hoc';
import {
  EMAIL_COMPOSITION_DIALOG,
  LEARNER_EMAIL_TYPE
} from './constants';
import { LEARNER_EMAIL_CONFIG } from './lib';
import {
  START_EMAIL_EDIT,
  UPDATE_EMAIL_VALIDATION,
  INITIATE_SEND_EMAIL,
} from '../../actions/email';
import { SHOW_DIALOG } from '../../actions/ui';
import { INITIAL_EMAIL_STATE } from '../../reducers/email';

describe('Specific email config', () => {
  let helper,
    listenForActions,
    EMAIL_DIALOG_ACTIONS = [
      START_EMAIL_EDIT,
      SHOW_DIALOG
    ];

  beforeEach(() => {
    helper = new IntegrationTestHelper();
    listenForActions = helper.listenForActions.bind(helper);
  });

  afterEach(() => {
    helper.cleanup();
  });

  let wrapContainerComponent = (component, emailKey, emailConfig) => (
    R.compose(
      withEmailDialog({
        [emailKey]: emailConfig
      })
    )(component)
  );

  let renderTestComponentWithDialog = (
    Component,
    emailKey,
    {
      emailState = INITIAL_EMAIL_STATE,
      dialogVisible = false
    } = {},
  ) => {
    let fullEmailState = {
      currentlyActive: emailKey,
      [emailKey]: emailState
    };
    return mount(
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <Component
          dispatch={helper.store.dispatch}
          ui={{dialogVisibility: {[EMAIL_COMPOSITION_DIALOG]: dialogVisible}}}
          email={fullEmailState}
        />
      </MuiThemeProvider>
    );
  };

  describe('for the learner email', () => {
    let wrapper,
      profile = R.clone(USER_PROFILE_RESPONSE);

    let filledOutEmailState = _.merge(
      R.clone(INITIAL_EMAIL_STATE), {
        params: {
          studentId: 123,
          profileImage: 'img.jpg'
        },
        inputs: {
          subject: 'subject',
          body: 'body'
        },
        subheading: 'first_name last_name'
      }
    );

    class TestContainerPage extends React.Component {
      render() {
        let {openEmailComposer} = this.props;
        return <div>
          <button onClick={R.partial(openEmailComposer(LEARNER_EMAIL_TYPE), [profile])}>
            Open Email
          </button>
        </div>;
      }
    }

    let wrappedContainerComponent = wrapContainerComponent(
      TestContainerPage,
      LEARNER_EMAIL_TYPE,
      LEARNER_EMAIL_CONFIG
    );

    it('should set the correct parameters when it opens', () => {
      wrapper = renderTestComponentWithDialog(wrappedContainerComponent, LEARNER_EMAIL_TYPE);
      let dialogComponent = wrapper.find('EmailCompositionDialog');
      let emailButton = wrapper.find('button');
      assert.equal(dialogComponent.props().title, LEARNER_EMAIL_CONFIG.title);

      return listenForActions(EMAIL_DIALOG_ACTIONS, () => {
        emailButton.simulate('click');
      }).then((state) => {
        let emailParams = state.email[LEARNER_EMAIL_TYPE].params;
        assert.equal(emailParams.studentId, profile.student_id);
        assert.isDefined(emailParams.profileImage);
      });
    });

    it('should render a subheading with a profile image and student name', () => {
      wrapper = renderTestComponentWithDialog(
        wrappedContainerComponent,
        LEARNER_EMAIL_TYPE,
        {emailState: filledOutEmailState, dialogVisible: true}
      );
      let dialogComponent = wrapper.find('EmailCompositionDialog');
      let renderedSubheading = mount(
        dialogComponent.props().subheadingRenderer(filledOutEmailState)
      );

      assert.equal(renderedSubheading.find('img').prop('src'), "img.jpg");
      assert.include(renderedSubheading.html(), "<span>first_name last_name</span>");
    });

    it('should call the appropriate API method with the right parameters upon submission', () => {
      wrapper = renderTestComponentWithDialog(
        wrappedContainerComponent,
        LEARNER_EMAIL_TYPE,
        {emailState: filledOutEmailState, dialogVisible: true}
      );
      let dialogComponent = wrapper.find('EmailCompositionDialog');

      return listenForActions([
        UPDATE_EMAIL_VALIDATION,
        INITIATE_SEND_EMAIL,
      ], () => {
        dialogComponent.props().closeEmailComposerAndSend();
      }).then(() => {
        assert.isTrue(helper.sendLearnerMail.calledOnce);
        assert.deepEqual(helper.sendLearnerMail.firstCall.args, ['subject', 'body', 123]);
      });
    });
  });
});

