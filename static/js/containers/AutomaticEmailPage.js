// @flow
/* global SETTINGS: false */
import React from 'react';
import { connect } from 'react-redux';
import R from 'ramda';
import type { Dispatch } from 'redux';

import { FETCH_PROCESSING } from '../actions';
import { actions } from '../lib/redux_rest.js';
import { S, getm } from '../lib/sanctuary';
import EmailCampaignsCard from '../components/EmailCampaignsCard';
import type { AutomaticEmail } from '../flow/emailTypes';
import type { RestState } from '../flow/restTypes';
import { hasAnyStaffRole } from '../lib/roles';
import Spinner from 'react-mdl/lib/Spinner';
import { toggleEmailPatchInFlight } from '../actions/automatic_emails';

const fetchingEmail = R.propEq('getStatus', FETCH_PROCESSING);

const noEmailsMessage = () => (
  <div>
    You haven't created any Email Campaigns yet.
  </div>
);

const emptyMessage = automaticEmails => (
  fetchingEmail(automaticEmails) ? <Spinner singleColor /> : noEmailsMessage()
);

const notEmpty = R.compose(R.not, R.isEmpty);

type AutomaticEmailsType = RestState<Array<AutomaticEmail>> & {
  emailsInFlight: Set<number>
};

class AutomaticEmailPage extends React.Component {
  props: {
    automaticEmails:  AutomaticEmailsType,
    dispatch:         Dispatch,
  };

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  componentWillMount () {
    if (!hasAnyStaffRole(SETTINGS.roles)) {
      this.context.router.push('/dashboard');
    }
  }

  componentDidMount () {
    const { dispatch, automaticEmails } = this.props;

    if (!automaticEmails.processing) {
      dispatch(actions.automaticEmails.get());
    }
  }

  // we use getm to get Maybe Array AutomaticEmail out of the store
  // if the data is [] we want to show a placeholder message instead
  // so we use filter to do Just([]) -> Nothing
  // 
  // Then we use `maybeToEither` to hold
  // Left(placeholderMessage) or Right(automaticEmails)
  // The placeholder message depends on whether we currently have a
  // GET request inflight or not
  getEmails = () => {
    const { automaticEmails } = this.props;
    return S.maybeToEither(
      emptyMessage(automaticEmails),
      S.filter(notEmpty, getm('data', automaticEmails))
    );
  };

  toggleEmailActive = email => {
    const { dispatch, automaticEmails: { emailsInFlight }} = this.props;

    if (! emailsInFlight.has(email.id)) {
      let updatedEmail = R.evolve({enabled: R.not}, email);
      dispatch(toggleEmailPatchInFlight(email.id));
      dispatch(actions.automaticEmails.patch(updatedEmail)).then(() => {
        dispatch(toggleEmailPatchInFlight(email.id));
      });
    }
  };

  render () {
    const { automaticEmails: { emailsInFlight }} = this.props;

    return (
      <div className="single-column automatic-emails">
        <EmailCampaignsCard
          getEmails={this.getEmails}
          toggleEmailActive={this.toggleEmailActive}
          emailsInFlight={emailsInFlight}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  automaticEmails: state.automaticEmails
});

export default connect(mapStateToProps)(AutomaticEmailPage);
