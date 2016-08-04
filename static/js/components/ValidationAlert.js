import React from 'react';
import _ from 'lodash';

import type { ValidationErrors } from '../flow/profileTypes';

export default class ValidationAlert extends React.Component {
  props: {
    errors:   ValidationErrors,
    children: React$Element[],
  };

  static message = "Please fix the errors above and try again";

  alertMessage: Function = (): React$Element|void => {
    const { errors } = this.props;
    if ( !_.isEmpty(errors) ) {
      return (
        <span className="message">
          { this.constructor.message }
        </span>
      );
    }
  };

  render () {
    const { children } = this.props;
    return (
      <div className="validation-alert">
        { this.alertMessage() }
        <div className="actions">
          { children }
        </div>
      </div>
    );
  }
}
