import React from 'react';
import { connect } from 'react-redux';
import {
  updateCheckbox,
  fetchCourseList,
  clearCourseList
} from '../actions/index';
import CourseList from '../components/CourseList';

class Dashboard extends React.Component {

  handleClick(e) {
    const { dispatch } = this.props;
    dispatch(updateCheckbox(e.target.checked));
  }
  componentDidMount() {
    this.fetchCourseList();
  }
  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(clearCourseList());
  }
  fetchCourseList() {
    const { courseList, dispatch } = this.props;
    if (courseList.courseListStatus === undefined) {
      dispatch(fetchCourseList());
    }
  }

  render() {
    const { checkbox, dispatch, courseList } = this.props;
    return <div>
      <div id="dashboard-body">
        <input type="checkbox" checked={checkbox.checked} onClick={this.handleClick.bind(this)} />
        <CourseList dispatch={dispatch} courseList={courseList.courseList}/>
      </div>
    </div>;
  }
}

Dashboard.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  checkbox: React.PropTypes.object.isRequired,
  courseList: React.PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
  return {
    checkbox: state.checkbox,
    courseList: state.courseList
  };
};

export default connect(mapStateToProps)(Dashboard);
