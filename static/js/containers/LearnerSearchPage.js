// @flow
/* global SETTINGS: false */
import React from 'react';
import { connect } from 'react-redux';
import {
  SearchkitManager,
  SearchkitProvider,
} from 'searchkit';
import _ from 'lodash';
import type { Dispatch } from 'redux';
import R from 'ramda';

import LearnerSearch from '../components/LearnerSearch';
import { setSearchFilterVisibility, setEmailDialogVisibility } from '../actions/ui';
import { startEmailEdit, updateEmailEdit, clearEmailEdit } from '../actions/email';
import type { UIState } from '../reducers/ui';
import type { EmailEditState } from '../reducers/email';
import { getCookie } from '../util/api';

class LearnerSearchPage extends React.Component {
  props: {
    ui:       UIState,
    email:    EmailEditState,
    dispatch: Dispatch,
  };

  checkFilterVisibility: Function = (filterName: string): boolean => {
    const { ui: { searchFilterVisibility } } = this.props;
    let visibility = searchFilterVisibility[filterName];
    return visibility === undefined ? false : visibility;
  };

  setFilterVisibility: Function = (filterName: string, visibility: boolean): void => {
    const { ui: { searchFilterVisibility }, dispatch } = this.props;
    let clone = _.clone(searchFilterVisibility);
    clone[filterName] = visibility;
    dispatch(setSearchFilterVisibility(clone));
  };

  openEmailComposer: Function = (sk) => {
    const { dispatch } = this.props;
    const query = JSON.stringify(sk.query);
    dispatch(startEmailEdit(query));
    dispatch(setEmailDialogVisibility(true));
  };

  closeEmailComposerAndCancel: Function = () => {
    const { dispatch } = this.props;
    dispatch(clearEmailEdit());
    dispatch(setEmailDialogVisibility(false));
  };

  closeEmailComposeAndSend: Function = () => {
    const { dispatch, email } = this.props;
    console.log(email); // eslint-disable-line no-console
    dispatch(clearEmailEdit());
    dispatch(setEmailDialogVisibility(false));
  };

  updateEmailEdit: Function = R.curry((fieldName, e) => {
    const { email, dispatch } = this.props;
    let emailClone = R.clone(email);
    emailClone[fieldName] = e.target.value;
    dispatch(updateEmailEdit(emailClone));
  });

  render () {
    const {
      ui: { emailDialogVisibility },
      email,
    } = this.props;

    let searchKit = new SearchkitManager(SETTINGS.search_url, {
      httpHeaders: {
        'X-CSRFToken': getCookie('csrftoken')
      }
    });
    return (
      <div>
        <SearchkitProvider searchkit={searchKit}>
          <LearnerSearch
            checkFilterVisibility={this.checkFilterVisibility}
            setFilterVisibility={this.setFilterVisibility}
            openEmailComposer={this.openEmailComposer}
            emailDialogVisibility={emailDialogVisibility}
            closeEmailDialog={this.closeEmailComposerAndCancel}
            updateEmailEdit={this.updateEmailEdit}
            sendEmail={this.closeEmailComposeAndSend}
            email={email}
          />
        </SearchkitProvider>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    ui:     state.ui,
    email:  state.email,
  };
};

export default connect(mapStateToProps)(LearnerSearchPage);
