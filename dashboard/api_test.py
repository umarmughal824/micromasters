"""
Tests for the dashboard api functions
"""
import json
import os
from datetime import datetime, timedelta

import pytz
from django.core.exceptions import ImproperlyConfigured
from django.test import TestCase
from mock import patch

from edx_api.certificates.models import Certificate, Certificates
from edx_api.enrollments.models import Enrollments

from courses.factories import (
    CourseFactory,
    CourseRunFactory,
)
from dashboard import api
from profiles.factories import UserFactory


class StatusTest(TestCase):
    """
    Tests for the different status classes
    """
    # pylint: disable= no-self-use
    def test_course_status(self):
        """test for CourseStatus"""
        for attr in ('PASSED', 'NOT_PASSED', 'CURRENT_GRADE', 'UPGRADE', 'NOT_OFFERED', 'OFFERED',):
            assert hasattr(api.CourseStatus, attr)

    def test_course_status_all_statuses(self):
        """test for CourseStatus.all_statuses"""
        all_constants = [value for name, value in vars(api.CourseStatus).items()
                         if not name.startswith('_') and isinstance(value, str)]
        assert sorted(all_constants) == sorted(api.CourseStatus.all_statuses())

    def test_course_run_status(self):
        """test for CourseRunStatus"""
        for attr in ('NOT_ENROLLED', 'GRADE', 'READ_CERT', 'WILL_ATTEND', 'UPGRADE', 'NOT_PASSED'):
            assert hasattr(api.CourseRunStatus, attr)

    def test_course_run_user_status(self):
        """test for CourseRunUserStatus"""
        ustat = api.CourseRunUserStatus(
            status='status',
            course_run='run',
            enrollment_for_course='enroll'
        )
        assert ustat.status == 'status'
        assert ustat.course_run == 'run'
        assert ustat.enrollment_for_course == 'enroll'

    def test_course_format_conditional_fields_struct(self):
        """
        test for CourseFormatConditionalFields:
        checking the association has the right structure and key/value pairs
        """
        assert isinstance(api.CourseFormatConditionalFields.ASSOCIATED_FIELDS, dict)
        for key in api.CourseFormatConditionalFields.ASSOCIATED_FIELDS:
            assert key in api.CourseStatus.all_statuses()
            assert isinstance(api.CourseFormatConditionalFields.ASSOCIATED_FIELDS[key], list)
            for assoc in api.CourseFormatConditionalFields.ASSOCIATED_FIELDS[key]:
                assert isinstance(assoc, dict)
                assert 'course_run_field' in assoc
                assert 'format_field' in assoc
                assert assoc['course_run_field'] not in ['', None]
                assert assoc['format_field'] not in ['', None]

    def test_course_format_conditional_fields_get(self):
        """test for CourseFormatConditionalFields.get_assoc_field"""
        with self.assertRaises(ImproperlyConfigured):
            api.CourseFormatConditionalFields.get_assoc_field('foobar')
        assert len(api.CourseFormatConditionalFields.get_assoc_field(api.CourseStatus.OFFERED)) == 2


class CourseMixin(TestCase):
    """Base class for APIs tests"""

    @classmethod
    def setUpTestData(cls):
        super(CourseMixin, cls).setUpTestData()
        cls.course = CourseFactory.create(title="Title")

        with open(os.path.join(os.path.dirname(__file__),
                               'fixtures/certificates.json')) as file_obj:
            cls.certificates_json = json.loads(file_obj.read())

        cls.certificates = Certificates(
            [Certificate(cert_json) for cert_json in cls.certificates_json])

    def setUp(self):
        super(CourseMixin, self).setUp()
        self.now = datetime.now(pytz.utc)

    def create_run(self, course=None, start=None, end=None, enr_start=None, enr_end=None, edx_key=None):
        """helper function to create course runs"""
        # pylint: disable=too-many-arguments
        run = CourseRunFactory.create(
            course=course or self.course,
            title="Title",
            start_date=start,
            end_date=end,
            enrollment_start=enr_start,
            enrollment_end=enr_end,
        )
        if edx_key is not None:
            run.edx_course_key = edx_key
            run.save()
        return run


class FormatRunTest(CourseMixin):
    """Tests for the format_course_for_dashboard function"""

    def test_format_run_no_run(self):
        """Test for format_course_for_dashboard"""
        self.assertEqual(
            api.format_course_for_dashboard(None, api.CourseStatus.PASSED, self.course),
            {
                'title': self.course.title,
                'status': api.CourseStatus.PASSED,
                'position_in_program': self.course.position_in_program
            }
        )

    def test_format_run(self):
        """Test for format_course_for_dashboard"""
        crun = self.create_run(
            start=self.now+timedelta(weeks=52),
            end=self.now+timedelta(weeks=62),
            enr_start=self.now+timedelta(weeks=40),
            enr_end=self.now+timedelta(weeks=50),
        )
        self.assertEqual(
            api.format_course_for_dashboard(crun, api.CourseStatus.PASSED, self.course),
            {
                'title': crun.title,
                'status': api.CourseStatus.PASSED,
                'position_in_program': self.course.position_in_program,
                'id': crun.pk,
                'course_id': crun.edx_course_key,
            }
        )

    def test_format_run_conditional(self):
        """Test for format_course_for_dashboard with conditional fields"""
        crun = self.create_run(
            start=self.now+timedelta(weeks=52),
            end=self.now+timedelta(weeks=62),
            enr_start=self.now+timedelta(weeks=40),
            enr_end=self.now+timedelta(weeks=50),
        )
        self.assertEqual(
            api.format_course_for_dashboard(crun, api.CourseStatus.OFFERED, self.course),
            {
                'title': crun.title,
                'status': api.CourseStatus.OFFERED,
                'position_in_program': self.course.position_in_program,
                'id': crun.pk,
                'course_id': crun.edx_course_key,
                'enrollment_start_date': crun.enrollment_start,
                'fuzzy_enrollment_start_date': crun.fuzzy_enrollment_start_date,
            }
        )

        # test that a weird status raises here
        with self.assertRaises(ImproperlyConfigured):
            api.format_course_for_dashboard(crun, 'foo_status', self.course)

    def test_format_run_no_certificate(self):
        """Test for format_course_for_dashboard with status PASSED and no certificate"""
        crun = self.create_run(
            edx_key="course-v1:edX+DemoX+Demo_Course",
            start=self.now+timedelta(weeks=52),
            end=self.now+timedelta(weeks=62),
            enr_start=self.now+timedelta(weeks=40),
            enr_end=self.now+timedelta(weeks=50),
        )
        self.assertEqual(
            api.format_course_for_dashboard(
                crun, api.CourseStatus.PASSED, self.course, certificate=None),
            {
                'title': crun.title,
                'status': api.CourseStatus.PASSED,
                'position_in_program': self.course.position_in_program,
                'id': crun.pk,
                'course_id': crun.edx_course_key,
            }
        )

    def test_format_run_certificate(self):
        """Test for format_course_for_dashboard with status PASSED and certificate"""
        crun = self.create_run(
            edx_key="course-v1:edX+DemoX+Demo_Course",
            start=self.now+timedelta(weeks=52),
            end=self.now+timedelta(weeks=62),
            enr_start=self.now+timedelta(weeks=40),
            enr_end=self.now+timedelta(weeks=50),
        )
        cert = self.certificates.get_verified_cert("course-v1:edX+DemoX+Demo_Course")
        assert cert is not None
        self.assertEqual(
            api.format_course_for_dashboard(
                crun, api.CourseStatus.PASSED, self.course, certificate=cert),
            {
                'title': crun.title,
                'status': api.CourseStatus.PASSED,
                'position_in_program': self.course.position_in_program,
                'id': crun.pk,
                'course_id': crun.edx_course_key,
                'grade': cert.grade,
                'certificate_url': cert.download_url,
            }
        )


class CourseRunTest(CourseMixin):
    """Tests for get_status_for_courserun"""

    @classmethod
    def setUpTestData(cls):
        super(CourseRunTest, cls).setUpTestData()
        with open(os.path.join(os.path.dirname(__file__),
                               'fixtures/user_enrollments.json')) as file_obj:
            cls.enrollments_json = json.loads(file_obj.read())

        cls.enrollments = Enrollments(cls.enrollments_json)

    def test_status_for_run_not_enrolled(self):
        """test for get_status_for_courserun"""
        now = datetime.now(pytz.utc)
        crun = self.create_run(
            start=now+timedelta(weeks=52),
            end=now+timedelta(weeks=62),
            enr_start=now+timedelta(weeks=40),
            enr_end=now+timedelta(weeks=50),
            edx_key='foo_edx_key'
        )
        run_status = api.get_status_for_courserun(crun, self.enrollments)
        assert isinstance(run_status, api.CourseRunUserStatus)
        assert run_status.status == api.CourseRunStatus.NOT_ENROLLED
        assert run_status.course_run == crun
        assert run_status.enrollment_for_course is None

    def test_verified_grade(self):
        """test for get_status_for_courserun"""
        now = datetime.now(pytz.utc)
        # create a run that is current
        crun = self.create_run(
            start=now-timedelta(weeks=1),
            end=now+timedelta(weeks=2),
            enr_start=now-timedelta(weeks=10),
            enr_end=now+timedelta(weeks=1),
            edx_key="course-v1:edX+DemoX+Demo_Course"
        )
        run_status = api.get_status_for_courserun(crun, self.enrollments)
        assert run_status.status == api.CourseRunStatus.GRADE
        assert run_status.course_run == crun
        assert (run_status.enrollment_for_course ==
                self.enrollments.get_enrollment_for_course("course-v1:edX+DemoX+Demo_Course"))

    def test_verified_read_cert(self):
        """test for get_status_for_courserun"""
        now = datetime.now(pytz.utc)
        # create a run that is past
        crun = self.create_run(
            start=now-timedelta(weeks=52),
            end=now-timedelta(weeks=45),
            enr_start=now-timedelta(weeks=62),
            enr_end=now-timedelta(weeks=53),
            edx_key="course-v1:edX+DemoX+Demo_Course"
        )
        run_status = api.get_status_for_courserun(crun, self.enrollments)
        assert run_status.status == api.CourseRunStatus.READ_CERT
        assert run_status.course_run == crun
        assert (run_status.enrollment_for_course ==
                self.enrollments.get_enrollment_for_course("course-v1:edX+DemoX+Demo_Course"))

    def test_verified_read_will_attend(self):
        """test for get_status_for_courserun"""
        now = datetime.now(pytz.utc)
        # create a run that is future
        crun = self.create_run(
            start=now+timedelta(weeks=52),
            end=now+timedelta(weeks=62),
            enr_start=now+timedelta(weeks=40),
            enr_end=now+timedelta(weeks=50),
            edx_key="course-v1:edX+DemoX+Demo_Course"
        )
        run_status = api.get_status_for_courserun(crun, self.enrollments)
        assert run_status.status == api.CourseRunStatus.WILL_ATTEND
        assert run_status.course_run == crun
        assert (run_status.enrollment_for_course ==
                self.enrollments.get_enrollment_for_course("course-v1:edX+DemoX+Demo_Course"))

    def test_not_verified_upgrade(self):
        """test for get_status_for_courserun"""
        now = datetime.now(pytz.utc)
        # create a run that is future
        future_run = self.create_run(
            start=now+timedelta(weeks=52),
            end=now+timedelta(weeks=62),
            enr_start=now+timedelta(weeks=40),
            enr_end=now+timedelta(weeks=50),
            edx_key="course-v1:MITx+8.MechCX+2014_T1"
        )
        # create a run that is current
        current_run = self.create_run(
            start=now-timedelta(weeks=1),
            end=now+timedelta(weeks=2),
            enr_start=now-timedelta(weeks=10),
            enr_end=now+timedelta(weeks=1),
            edx_key="course-v1:MITx+8.MechCX+2014_T1"
        )
        run_status = api.get_status_for_courserun(future_run, self.enrollments)
        assert run_status.status == api.CourseRunStatus.UPGRADE
        assert run_status.course_run == future_run
        assert (run_status.enrollment_for_course ==
                self.enrollments.get_enrollment_for_course("course-v1:MITx+8.MechCX+2014_T1"))
        run_status = api.get_status_for_courserun(current_run, self.enrollments)
        assert run_status.status == api.CourseRunStatus.UPGRADE
        assert run_status.course_run == current_run
        assert (run_status.enrollment_for_course ==
                self.enrollments.get_enrollment_for_course("course-v1:MITx+8.MechCX+2014_T1"))

    def test_not_verified_not_passed(self):
        """test for get_status_for_courserun"""
        now = datetime.now(pytz.utc)
        # create a run that is past
        crun = self.create_run(
            start=now-timedelta(weeks=52),
            end=now-timedelta(weeks=45),
            enr_start=now-timedelta(weeks=62),
            enr_end=now-timedelta(weeks=53),
            edx_key="course-v1:MITx+8.MechCX+2014_T1"
        )
        run_status = api.get_status_for_courserun(crun, self.enrollments)
        assert run_status.status == api.CourseRunStatus.NOT_PASSED
        assert run_status.course_run == crun
        assert (run_status.enrollment_for_course ==
                self.enrollments.get_enrollment_for_course("course-v1:MITx+8.MechCX+2014_T1"))


class InfoCourseTest(CourseMixin):
    """Tests for get_info_for_course"""

    @classmethod
    def setUpTestData(cls):
        super(InfoCourseTest, cls).setUpTestData()
        cls.user = UserFactory()
        cls.course_noruns = CourseFactory.create(title="Title no runs")

        now = datetime.now(pytz.utc)
        # create a run that is current
        cls.course_run = cls.create_run(
            cls,
            start=now-timedelta(weeks=1),
            end=now+timedelta(weeks=2),
            enr_start=now-timedelta(weeks=10),
            enr_end=now+timedelta(weeks=1),
            edx_key="course-v1:MITx+8.MechCX+2014_T1"
        )
        # and a run that is past and verified
        cls.course_run_ver = cls.create_run(
            cls,
            start=now-timedelta(weeks=10),
            end=now-timedelta(weeks=2),
            enr_start=now-timedelta(weeks=20),
            enr_end=now-timedelta(weeks=10),
            edx_key="course-v1:edX+DemoX+Demo_Course"
        )

    @patch('dashboard.api.format_course_for_dashboard', autospec=True)
    def test_info_no_runs(self, mock_format):
        """test for get_info_for_course"""
        api.get_info_for_course(self.user, self.course_noruns, None, None)
        mock_format.assert_called_once_with(None, api.CourseStatus.NOT_OFFERED, self.course_noruns)

    @patch('dashboard.api.format_course_for_dashboard', autospec=True)
    def test_info_not_enrolled_not_passed(self, mock_format):
        """test for get_info_for_course"""
        with patch(
            'dashboard.api.get_status_for_courserun',
            autospec=True,
            return_value=api.CourseRunUserStatus(
                status=api.CourseRunStatus.NOT_ENROLLED,
                course_run=self.course_run
            )
        ):
            api.get_info_for_course(self.user, self.course, None, None)
        mock_format.assert_called_once_with(self.course_run, api.CourseStatus.OFFERED, self.course)

        mock_format.reset_mock()

        with patch(
            'dashboard.api.get_status_for_courserun',
            autospec=True,
            return_value=api.CourseRunUserStatus(
                status=api.CourseRunStatus.NOT_PASSED,
                course_run=self.course_run
            )
        ):
            api.get_info_for_course(self.user, self.course, None, None)
        mock_format.assert_called_once_with(self.course_run, api.CourseStatus.OFFERED, self.course)

    @patch('dashboard.api.format_course_for_dashboard', autospec=True)
    def test_info_not_enrolled_not_passed_not_offered(self, mock_format):
        """test for get_info_for_course"""
        with patch(
            'dashboard.api.get_status_for_courserun',
            autospec=True,
            return_value=api.CourseRunUserStatus(
                status=api.CourseRunStatus.NOT_PASSED,
                course_run=self.course_run
            )
        ), patch('courses.models.Course.get_next_run', autospec=True, return_value=None):
            api.get_info_for_course(self.user, self.course, None, None)
        mock_format.assert_called_once_with(None, api.CourseStatus.NOT_OFFERED, self.course)

    @patch('dashboard.api.format_course_for_dashboard', autospec=True)
    def test_info_grade(self, mock_format):
        """test for get_info_for_course"""
        with patch(
            'dashboard.api.get_status_for_courserun',
            autospec=True,
            return_value=api.CourseRunUserStatus(
                status=api.CourseRunStatus.GRADE,
                course_run=self.course_run
            )
        ):
            api.get_info_for_course(self.user, self.course, None, None)
        mock_format.assert_called_once_with(self.course_run, api.CourseStatus.CURRENT_GRADE, self.course)

    @patch('dashboard.api.format_course_for_dashboard', autospec=True)
    def test_info_read_cert_no_verified_cert(self, mock_format):
        """
        test for get_info_for_course in case there is not verified certificate for the course
        """
        with patch(
            'dashboard.api.get_status_for_courserun',
            autospec=True,
            return_value=api.CourseRunUserStatus(
                status=api.CourseRunStatus.READ_CERT,
                course_run=self.course_run
            )
        ):
            api.get_info_for_course(self.user, self.course, None, self.certificates)
        mock_format.assert_called_once_with(self.course_run, api.CourseStatus.OFFERED, self.course)

    @patch('dashboard.api.format_course_for_dashboard', autospec=True)
    def test_info_read_cert_with_ver_cert(self, mock_format):
        """
        test for get_info_for_course in case there is a certificate for the course
        """
        with patch(
            'dashboard.api.get_status_for_courserun',
            autospec=True,
            return_value=api.CourseRunUserStatus(
                status=api.CourseRunStatus.READ_CERT,
                course_run=self.course_run_ver
            )
        ):
            api.get_info_for_course(self.user, self.course, None, self.certificates)
        mock_format.assert_called_once_with(
            self.course_run_ver,
            api.CourseStatus.PASSED,
            self.course,
            self.certificates.get_verified_cert(self.course_run_ver.edx_course_key)
        )

    @patch('dashboard.api.format_course_for_dashboard', autospec=True)
    def test_info_will_attend(self, mock_format):
        """test for get_info_for_course"""
        with patch(
            'dashboard.api.get_status_for_courserun',
            autospec=True,
            return_value=api.CourseRunUserStatus(
                status=api.CourseRunStatus.WILL_ATTEND,
                course_run=self.course_run
            )
        ):
            api.get_info_for_course(self.user, self.course, None, None)
        mock_format.assert_called_once_with(self.course_run, api.CourseStatus.CURRENT_GRADE, self.course)

    @patch('dashboard.api.format_course_for_dashboard', autospec=True)
    def test_info_upgrade(self, mock_format):
        """test for get_info_for_course"""
        with patch(
            'dashboard.api.get_status_for_courserun',
            autospec=True,
            return_value=api.CourseRunUserStatus(
                status=api.CourseRunStatus.UPGRADE,
                course_run=self.course_run
            )
        ):
            api.get_info_for_course(self.user, self.course, None, None)
        mock_format.assert_called_once_with(self.course_run, api.CourseStatus.UPGRADE, self.course)

    @patch('dashboard.api.format_course_for_dashboard', autospec=True)
    def test_info_default_should_not_happen(self, mock_format):
        """test for get_info_for_course"""
        with patch(
            'dashboard.api.get_status_for_courserun',
            autospec=True,
            return_value=api.CourseRunUserStatus(
                status='status-that-we-should-never-have',
                course_run=self.course_run
            )
        ):
            api.get_info_for_course(self.user, self.course, None, None)
        mock_format.assert_called_once_with(self.course_run, api.CourseStatus.OFFERED, self.course)

    @patch('dashboard.api.format_course_for_dashboard', autospec=True)
    def test_course_run_end_date_mixed(self, mock_format):
        """
        Test with a mix of end_date being None and also a valid date
        """
        def mocked_get_status_for_courserun(run, enrollments):  # pylint: disable=unused-argument
            """Mock get_status_for_courserun with different values for each run"""
            return api.CourseRunUserStatus(
                status=api.CourseRunStatus.NOT_ENROLLED,
                course_run=run
            )

        run1 = CourseRunFactory.create(
            start_date=datetime.now(pytz.utc),
            end_date=None
        )
        CourseRunFactory.create(
            start_date=datetime.now(pytz.utc),
            end_date=datetime.now(pytz.utc),
            course=run1.course
        )
        with patch(
            'dashboard.api.get_status_for_courserun',
            autospec=True,
            side_effect=mocked_get_status_for_courserun
        ):
            api.get_info_for_course(self.user, run1.course, None, None)
        mock_format.assert_called_once_with(run1, api.CourseStatus.OFFERED, run1.course)
