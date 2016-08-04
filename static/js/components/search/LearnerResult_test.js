// @flow
/* global SETTINGS: false */
import React from 'react';
import { assert } from 'chai';

import LearnerResult from './LearnerResult';
import { makeStrippedHtml } from '../../util/util';
import { USER_PROFILE_RESPONSE } from '../../constants';

describe('LearnerResult', () => {
  let renderLearnerResult = props => (
    makeStrippedHtml(<LearnerResult {...props} />)
  );

  let elasticHit = {
    result: { _source: { profile: USER_PROFILE_RESPONSE } }
  };

  it("should include the user's name", () => {
    let result = renderLearnerResult(elasticHit);
    assert.deepEqual(
      result.includes(USER_PROFILE_RESPONSE.preferred_name),
      true
    );
    assert.deepEqual(
      result.includes(USER_PROFILE_RESPONSE.last_name),
      true
    );
  });

  it("should include the user's location", () => {
    let result = renderLearnerResult(elasticHit);
    assert.deepEqual(
      result.includes(USER_PROFILE_RESPONSE.city),
      true
    );
    assert.deepEqual(
      result.includes(USER_PROFILE_RESPONSE.state_or_territory),
      true
    );
    assert.deepEqual(
      result.includes(USER_PROFILE_RESPONSE.country),
      true
    );
  });

  it("should include the user's current grade", () => {
    // currently this is hardcoded, we don't have the data on the backend
    let result = renderLearnerResult(elasticHit);
    assert.deepEqual(result.includes("75%"), true);
    assert.deepEqual(result.includes("Current grade"), true);
  });
});
