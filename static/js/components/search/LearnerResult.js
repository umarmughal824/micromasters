// @flow
import React from 'react';
import Grid, { Cell } from 'react-mdl/lib/Grid';

import ProfileImage from '../ProfileImage';
import { getPreferredName, getLocation } from '../../util/util';
import type { SearchResult } from '../../flow/searchTypes';

export default class LearnerResult extends React.Component {
  props: {
    result: { _source: SearchResult }
  };

  render () {
    const { result: { _source: { profile } } } = this.props;
    return (
      <Grid className="search-grid learner-result">
        <Cell col={2}>
          <ProfileImage profile={profile} />
        </Cell>
        <Cell col={2} className="learner-name centered">
          <span>
            { getPreferredName(profile) }
          </span>
        </Cell>
        <Cell col={2} className="centered">
          <span>
            { getLocation(profile) }
          </span>
        </Cell>
        <Cell col={2} className="learner-grade">
          <span className="percent">75%</span>
          <span className="hint">Current grade</span>
        </Cell>
        <Cell col = {4}></Cell>
      </Grid>
    );
  }
}
