/* global SETTINGS: false */
import React from 'react';

class UserImage extends React.Component {
  render() {
    const { imageUrl } = this.props;

    return <img
      className="card-image" src={ imageUrl }
      alt={"Profile image for " + SETTINGS.name}/>;
  }
}

UserImage.propTypes = {
  imageUrl: React.PropTypes.string.isRequired
};
export default UserImage;
