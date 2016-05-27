import React from 'react';
import Grid, { Cell } from 'react-mdl/lib/Grid';
import { Card, CardMenu } from 'react-mdl/lib/Card';
import IconButton from 'react-mdl/lib/IconButton';
import iso3166 from 'iso-3166-2';

import { makeProfileImageUrl } from '../util/util';
import EmploymentForm from './EmploymentForm';
import EducationForm from './EducationForm';

export default class User extends React.Component {
  static propTypes = {
    profile: React.PropTypes.object
  };

  render() {
    const { profile } = this.props;

    let getStateName = () => (
      iso3166.subdivision(profile.state_or_territory).name
    );

    let imageUrl = makeProfileImageUrl(profile);
    return <div className="card">
      <Grid className="card-user">
        <Cell col={5} />
        <Cell col={2} className="card-image-box">
          <img
            src={imageUrl}
            alt={`Profile image for ${profile.preferred_name}`}
            className="card-image"
            style={{
              top: "50%",
              position: "relative",
              zIndex: 2
            }}
          />
        </Cell>
      </Grid>
      <Card shadow={0} style={{width: "100%"}}>
        <h3 className="users-name" style={{marginTop: 50}}>
          { profile.preferred_name }
        </h3>

        <span className="users-location">
          { profile.city }, { getStateName() }
        </span>
        <CardMenu>
          <IconButton name="edit" />
        </CardMenu>
      </Card>

      <Grid className="user-cards-grid">
        <Cell col={6}>
          <EmploymentForm {...this.props} />
        </Cell>
        <Cell col={6}>
          <EducationForm {...this.props} />
        </Cell>
      </Grid>
    </div>;
  }
}
