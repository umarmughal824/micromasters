import React from 'react';
import Dialog from 'material-ui/Dialog';
import Button from 'react-mdl/lib/Button';

export default class ConfirmDeletion extends React.Component {
  static propTypes = {
    close:        React.PropTypes.func,
    deleteEntry:  React.PropTypes.func,
    open:         React.PropTypes.bool,
  };

  deleteAndClose = () => {
    const { close, deleteEntry } = this.props;
    deleteEntry();
    close();
  };

  render () {
    const { close, open } = this.props;
    let actions = [
      <Button
        type='button'
        key='close'
        className="cancel-button"
        onClick={close}>
        No
      </Button>,
      <Button
        key='delete'
        type='button'
        className="delete-button"
        onClick={this.deleteAndClose}>
        Yes
      </Button>
    ];
    return (
      <Dialog
        className={"deletion-confirmation"}
        open={open}
        onRequestClose={close}
        actions={actions}
        autoScrollBodyContent={true}
      >
        Delete this entry?
      </Dialog>
    );
  }
}
