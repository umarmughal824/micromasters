// @flow
import R from 'ramda';
import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Card, CardTitle } from 'react-mdl/lib/Card';

import type { Program, Course } from '../../flow/programTypes';
import type {
  CalculatedPrices,
  Coupon,
} from '../../flow/couponTypes';
import type { EmailState } from '../../flow/emailTypes';
import CourseRow from './CourseRow';
import FinancialAidCalculator from '../../containers/FinancialAidCalculator';
import EmailCompositionDialog from '../email/EmailCompositionDialog';
import { COURSE_EMAIL_TYPE } from '../email/constants';

export default class CourseListCard extends React.Component {
  props: {
    coupon:                       ?Coupon,
    program:                      Program,
    courseEnrollAddStatus?:       string,
    prices:                       CalculatedPrices,
    openFinancialAidCalculator?:  () => void,
    now?:                         Object,
    addCourseEnrollment:          (courseId: string) => void,
    openEmailComposer:            (course: Course) => void,
    closeEmailDialog:             () => void,
    updateEmailEdit:              (o: Object) => void,
    sendEmail:                    () => void,
    emailDialogVisibility:        boolean,
    email:                        EmailState,
  };

  render() {
    let {
      program,
      prices,
      now,
      coupon,
      openFinancialAidCalculator,
      addCourseEnrollment,
      courseEnrollAddStatus,
      openEmailComposer,
      closeEmailDialog,
      updateEmailEdit,
      sendEmail,
      emailDialogVisibility,
      email
    } = this.props;
    if (now === undefined) {
      now = moment();
    }

    let sortedCourses = _.orderBy(program.courses, 'position_in_program');
    let courseRows = sortedCourses.map(course =>
      <CourseRow
        coupon={coupon}
        hasFinancialAid={program.financial_aid_availability}
        financialAid={program.financial_aid_user_info}
        course={course}
        courseEnrollAddStatus={courseEnrollAddStatus}
        key={course.id}
        openFinancialAidCalculator={openFinancialAidCalculator}
        prices={prices}
        now={now}
        addCourseEnrollment={addCourseEnrollment}
        openEmailComposer={R.partial(openEmailComposer, [course])}
      />
    );

    return <Card shadow={0} className="course-list">
      <FinancialAidCalculator />
      <CardTitle>Required Courses</CardTitle>
      { courseRows }
      <EmailCompositionDialog
        open={emailDialogVisibility}
        closeEmailDialog={closeEmailDialog}
        updateEmailEdit={updateEmailEdit}
        email={email}
        sendEmail={sendEmail}
        subheadingType={COURSE_EMAIL_TYPE}
        title="Contact the Course Team"
      />
    </Card>;
  }
}
