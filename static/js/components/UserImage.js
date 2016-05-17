/* global SETTINGS: false */
import React from 'react';

class UserImage extends React.Component {
  static propTypes = {
    imageUrl: React.PropTypes.string.isRequired
  };

  render() {
    const { imageUrl } = this.props;

    return <img
      className="card-image" src={ imageUrl }
      alt={"Profile image for " + SETTINGS.name}/>;
  }
}

export default UserImage;
