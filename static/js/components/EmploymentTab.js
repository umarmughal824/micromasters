import React from 'react';

class EmploymentTab extends React.Component {
  render () {
    return (
      <div>
        Employment
        <br/>
        id: {this.props.profile.pretty_printed_student_id}
      </div>
    );
  }
}

EmploymentTab.propTypes = {
  profile:    React.PropTypes.object,
  saveProfile:    React.PropTypes.func,
  updateProfile:  React.PropTypes.func,
}

export default EmploymentTab;
