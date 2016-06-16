// @flow
import React from 'react';
import Alert from 'react-bootstrap/lib/Alert';


export default class ErrorMessage extends React.Component {
  static propTypes = {
    errorInfo:   React.PropTypes.object.isRequired,
  };

  render() {
    const { errorInfo: {error_code: errorCode, user_message: userMessage} } = this.props;

    let errorCodeStr = '';
    let userMessageStr = '';
    if (errorCode !== undefined) {
      errorCodeStr = `${errorCode}: `;
    }
    if (userMessage !== undefined) {
      userMessageStr = `Additional info: ${userMessage}`;
    }

    return (
      <div className="alert-message">
        <Alert bsStyle="danger">
          <p>{ errorCodeStr }Sorry, we were unable to load the data necessary to
          process your request. Please reload the page.</p>
          <p>{ userMessageStr }</p>
          <p>
            If the error persists, please contact <a href="mailto:mitx-support@mit.edu">
            mitx-support@mit.edu</a> specifying
            this entire error message.
          </p>
        </Alert>
      </div>
    );
  }
}
