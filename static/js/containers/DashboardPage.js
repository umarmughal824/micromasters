import React from 'react';
import { connect } from 'react-redux';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import {
  fetchCourseList,
  clearCourseList
} from '../actions/index';

class DashboardPage extends React.Component {
  componentDidMount() {
    this.fetchCourseList();
  }

  componentDidUpdate() {
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
    const { courseList } = this.props;
    return <div>
      <Header />
      <Dashboard courseList={courseList.courseList} />
    </div>;
  }
}

const mapStateToProps = (state) => {
  return {
    courseList: state.courseList
  };
};

DashboardPage.propTypes = {
  courseList: React.PropTypes.object.isRequired,
  dispatch: React.PropTypes.func.isRequired
};

export default connect(mapStateToProps)(DashboardPage);
