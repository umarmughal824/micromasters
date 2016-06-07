import React from 'react';
import Dialog from 'material-ui/Dialog';
import Button from 'react-mdl/lib/Button';

import { saveProfileStep } from '../util/profile_edit';
import PersonalForm from './PersonalForm';

export default class UserPagePersonalDialog extends React.Component {
  static propTypes = {
    setUserPageDialogVisibility:  React.PropTypes.func,
    ui:                           React.PropTypes.object,
    clearProfileEdit:             React.PropTypes.func,
  };

  closePersonalDialog = () => {
    const { setUserPageDialogVisibility, clearProfileEdit } = this.props;
    setUserPageDialogVisibility(false);
    clearProfileEdit();
  };

  savePersonalInfo = () => {
    saveProfileStep.call(this).then(() => {
      this.closePersonalDialog();
    });
  };

  render () {
    const { ui: { userPageDialogVisibility } } = this.props;
    const actions = [
      <Button
        type='button'
        key='cancel'
        className='cancel-button'
        onClick={this.closePersonalDialog}>
        Cancel
      </Button>,
      <Button
        key='save'
        type='button'
        className='save-button'
        onClick={this.savePersonalInfo}>
        Save
      </Button>
    ];

    return (
      <Dialog
        open={userPageDialogVisibility}
        onRequestClose={this.closePersonalDialog}
        actions={actions}
        autoScrollBodyContent={true}>
        <PersonalForm {...this.props} />
      </Dialog>
    );
  }
}
