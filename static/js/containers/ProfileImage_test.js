/* global SETTINGS: false */
import '../global_init';

import React from 'react';
import { mount } from 'enzyme';
import { assert } from 'chai';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import ProfileImage from './ProfileImage';
import IntegrationTestHelper from '../util/integration_test_helper';

describe('ProfileImage', () => {
  let helper;

  const renderProfileImage = (profile, editable=true) => (
    mount(
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <ProfileImage
          profile={profile} 
          store={helper.store}
          editable={editable}
        />
      </MuiThemeProvider>
    )
  );

  const thatProfile = {
    username: 'rfeather',
    email: 'rf@example.com',
    first_name: 'Reginald',
    last_name: 'Feathersworth',
    preferred_name: 'Reggie'
  };

  beforeEach(() => {
    helper = new IntegrationTestHelper();
  });

  afterEach(() => {
    helper.cleanup();
  });

  describe('upload button', () => {
    it('should be hidden if not editable', () => {
      let image = renderProfileImage(SETTINGS.user, false);

      assert.lengthOf(
        image.find('.open-photo-dialog'),
        0,
        'image should contain a button to upload a profile photo'
      );

    });

    it('should be visible if editable and is users own profile', () => {
      let image = renderProfileImage(SETTINGS.user);

      assert.lengthOf(
        image.find('.open-photo-dialog'),
        1,
        'image should contain a button to upload a profile photo'
      );

    });

    it('should be hidden if editable and another users profile', () => {
      let image = renderProfileImage(thatProfile);

      assert(
        image.find('.open-photo-dialog'),
        0,
        'image should not contain a button to upload a profile photo'
      );
    });

  });
});
