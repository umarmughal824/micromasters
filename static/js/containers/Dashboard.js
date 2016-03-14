import React from 'react';
import { connect } from 'react-redux';
import {
  updateCheckbox
} from '../actions';

class Dashboard extends React.Component {

  handleClick(e) {
    const { dispatch } = this.props;
    dispatch(updateCheckbox(e.target.checked));
  }

  render() {
    const { checked } = this.props.checkbox;
    return <div>
      <div id="dashboard-body">
        <input type="checkbox" checked={checked} onClick={this.handleClick.bind(this)} />
      </div>
    </div>;
  }
}

Dashboard.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  checkbox: React.PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
  return {
    checkbox: state.checkbox,
  };
};

export default connect(mapStateToProps)(Dashboard);
