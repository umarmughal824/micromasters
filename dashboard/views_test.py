"""
Tests for the dashboard views
"""
import json
import os
from datetime import datetime, timedelta

import pytz
from django.core.urlresolvers import reverse
from mock import patch
from rest_framework import status
from rest_framework.test import APITestCase

from edx_api.enrollments.models import Enrollments

from courses.factories import (
    ProgramFactory,
    CourseFactory,
    CourseRunFactory,
)
from dashboard.api import CourseStatus
from profiles.factories import UserFactory


class DashboardTest(APITestCase):
    """
    Tests for dashboard Rest API
    """

    @classmethod
    def setUpTestData(cls):
        super(DashboardTest, cls).setUpTestData()
        # create an user
        cls.user = UserFactory.create()
        # create a social auth for the user
        cls.user.social_auth.create(
            provider='edxorg',
            uid=cls.user.username,
            extra_data='{"access_token": "fooooootoken"}'
        )

        # create an enrollments object
        with open(os.path.join(os.path.dirname(__file__),
                               'fixtures/user_enrollments.json')) as file_obj:
            cls.enrollments_json = json.loads(file_obj.read())
        cls.enrollments = Enrollments(cls.enrollments_json)

        # create the programs
        cls.program_1 = ProgramFactory.create()
        cls.program_2 = ProgramFactory.create()

        # create some courses for each program
        cls.courses_1 = []
        cls.courses_2 = []
        for num in range(2):
            cls.courses_1.append(
                CourseFactory.create(
                    title="title course prog1 {}".format(num),
                    program=cls.program_1
                )
            )
            cls.courses_2.append(
                CourseFactory.create(
                    title="title course prog2 {}".format(num),
                    program=cls.program_2
                )
            )

        # url for the dashboard
        cls.url = reverse('dashboard_api')

    def setUp(self):
        super(DashboardTest, self).setUp()
        self.client.force_login(self.user)
        self.now = datetime.now(pytz.utc)

    def create_run(self, course=None, start=None, end=None, enr_start=None, enr_end=None, edx_key=None):
        """helper function to create course runs"""
        # pylint: disable=too-many-arguments
        run = CourseRunFactory.create(
            course=course or self.course,
            title="Title Run",
            start_date=start,
            end_date=end,
            enrollment_start=enr_start,
            enrollment_end=enr_end,
        )
        if edx_key is not None:
            run.edx_course_key = edx_key
            run.save()
        return run

    def test_anonym_access(self):
        """Test for GET"""
        self.client.logout()
        res = self.client.get(self.url)
        assert res.status_code == status.HTTP_403_FORBIDDEN

    def test_no_run_available(self):
        """Test for GET"""
        with patch(
            'edx_api.enrollments.CourseEnrollments.get_student_enrollments',
            autospec=True,
            return_value=self.enrollments
        ):
            res = self.client.get(self.url)
        assert res.status_code == status.HTTP_200_OK
        data = res.data
        assert len(data) == 2
        for program in data:
            assert 'courses' in program
            assert len(program['courses']) == 2
            for course in program['courses']:
                assert course['status'] == CourseStatus.NOT_OFFERED

    def test_with_runs(self):
        """Test for GET"""
        # create some runs
        self.create_run(
            course=self.courses_1[0],
            start=self.now+timedelta(weeks=52),
            end=self.now+timedelta(weeks=62),
            enr_start=self.now+timedelta(weeks=40),
            enr_end=self.now+timedelta(weeks=50),
            edx_key="course-v1:edX+DemoX+Demo_Course"
        )
        self.create_run(
            course=self.courses_1[1],
            start=self.now-timedelta(weeks=1),
            end=self.now+timedelta(weeks=2),
            enr_start=self.now-timedelta(weeks=10),
            enr_end=self.now+timedelta(weeks=1),
            edx_key="course-v1:MITx+8.MechCX+2014_T1"
        )
        with patch(
            'edx_api.enrollments.CourseEnrollments.get_student_enrollments',
            autospec=True,
            return_value=self.enrollments
        ):
            res = self.client.get(self.url)
        assert res.status_code == status.HTTP_200_OK
        data = res.data
        assert len(data) == 2
        for program in data:
            assert 'courses' in program
            assert len(program['courses']) == 2
            for course_data in program['courses']:
                assert 'status' in course_data
                assert 'runs' in course_data
                if len(course_data['runs']) == 1:
                    assert 'course_id' in course_data['runs'][0]
                    if course_data['runs'][0]['course_id'] == "course-v1:edX+DemoX+Demo_Course":
                        assert course_data['runs'][0]['status'] == CourseStatus.CURRENT_GRADE
                    if course_data['runs'][0]['course_id'] == "course-v1:MITx+8.MechCX+2014_T1":
                        assert course_data['runs'][0]['status'] == CourseStatus.UPGRADE
