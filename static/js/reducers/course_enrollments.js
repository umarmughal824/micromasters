// @flow
import { POST } from '../constants';

export const courseEnrollmentsEndpoint = {
  name: 'courseEnrollments',
  verbs: [POST],
  postUrl: '/api/v0/course_enrollments/',
  postOptions: (courseId: number) => ({
    method: POST,
    body: JSON.stringify({ course_id: courseId }),
  }),
};
