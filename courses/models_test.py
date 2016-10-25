"""
Model tests
"""
# pylint: disable=no-self-use
from datetime import datetime, timedelta

import pytz

from courses.factories import (
    ProgramFactory,
    CourseFactory,
    CourseRunFactory,
)
from courses.models import CourseRun
from search.base import ESTestCase


class ProgramTests(ESTestCase):
    """Tests for Program model"""

    def test_to_string(self):
        """Test for __str__ method"""
        prog = ProgramFactory.build(title="Title")
        assert "{}".format(prog) == "Title"


class CourseModelTests(ESTestCase):
    """Mixin for Course models"""

    @classmethod
    def setUpTestData(cls):
        super(CourseModelTests, cls).setUpTestData()
        cls.course = CourseFactory.create(title="Title")

    def setUp(self):
        super(CourseModelTests, self).setUp()
        self.now = datetime.now(pytz.utc)

    def create_run(self, course=None, start=None, end=None,
                   enr_start=None, enr_end=None, upgrade_deadline=None):
        """helper function to create course runs"""
        # pylint: disable=too-many-arguments
        return CourseRunFactory.create(
            course=course or self.course,
            title="Title Run",
            start_date=start,
            end_date=end,
            enrollment_start=enr_start,
            enrollment_end=enr_end,
            upgrade_deadline=upgrade_deadline,
        )


class GetFirstUnexpiredRunTests(CourseModelTests):  # pylint: disable=too-many-public-methods
    """Tests for get_unexpired_run function"""

    def test_no_run(self):
        """
        No run available
        """
        assert self.course.get_first_unexpired_run() is None

    def test_only_past(self):
        """
        enrollment past and course past
        """
        self.create_run(
            start=self.now-timedelta(weeks=52),
            end=self.now-timedelta(weeks=45),
            enr_start=self.now-timedelta(weeks=62),
            enr_end=self.now-timedelta(weeks=53),
        )
        assert self.course.get_first_unexpired_run() is None

    def test_present_enroll_closed(self):
        """
        enrollment past, course present
        """
        self.create_run(
            start=self.now-timedelta(weeks=1),
            end=self.now+timedelta(weeks=2),
            enr_start=self.now-timedelta(weeks=10),
            enr_end=self.now-timedelta(weeks=3),
        )
        assert self.course.get_first_unexpired_run() is None

    def test_present_enroll_closed_course_future(self):
        """
        enrollment past, course future
        """
        self.create_run(
            start=self.now+timedelta(weeks=1),
            end=self.now+timedelta(weeks=3),
            enr_start=self.now-timedelta(weeks=10),
            enr_end=self.now-timedelta(weeks=3),
        )
        assert self.course.get_first_unexpired_run() is None

    def test_enroll_none_course_past(self):
        """
        enrollment none, course past
        """
        self.create_run(
            start=self.now-timedelta(weeks=10),
            end=self.now-timedelta(weeks=3),
        )
        assert self.course.get_first_unexpired_run() is None

    def test_only_present_forever(self):
        """
        enrollment none, course started in the past with no end
        """
        course_run = self.create_run(
            start=self.now-timedelta(weeks=52),
        )
        next_run = self.course.get_first_unexpired_run()
        assert isinstance(next_run, CourseRun)
        assert next_run.pk == course_run.pk

    def test_enr_present_course_future(self):
        """
        enrollment present, course future
        """
        course_run = self.create_run(
            start=self.now+timedelta(weeks=1),
            end=self.now+timedelta(weeks=4),
            enr_start=self.now-timedelta(weeks=10),
            enr_end=self.now+timedelta(weeks=1),
        )
        next_run = self.course.get_first_unexpired_run()
        assert isinstance(next_run, CourseRun)
        assert next_run.pk == course_run.pk

    def test_present_enroll_open(self):
        """
        enrollment present, course present
        """
        course_run = self.create_run(
            start=self.now-timedelta(weeks=1),
            end=self.now+timedelta(weeks=2),
            enr_start=self.now-timedelta(weeks=10),
            enr_end=self.now+timedelta(weeks=1),
        )
        next_run = self.course.get_first_unexpired_run()
        assert isinstance(next_run, CourseRun)
        assert next_run.pk == course_run.pk

    def test_present_enroll_open_null(self):
        """
        enrollment past with no end, course present
        """
        course_run = self.create_run(
            start=self.now-timedelta(weeks=1),
            end=self.now+timedelta(weeks=2),
            enr_start=self.now-timedelta(weeks=10),
        )
        next_run = self.course.get_first_unexpired_run()
        assert isinstance(next_run, CourseRun)
        assert next_run.pk == course_run.pk

    def test_present_enroll_open_with_future_present(self):
        """
        one run with enrollment present and course present
        and one run with enrollment future and course future
        """
        course_run = self.create_run(
            start=self.now-timedelta(weeks=1),
            end=self.now+timedelta(weeks=2),
            enr_start=self.now-timedelta(weeks=10),
            enr_end=self.now+timedelta(weeks=1),
        )
        self.create_run(
            start=self.now+timedelta(weeks=52),
            end=self.now+timedelta(weeks=62),
            enr_start=self.now+timedelta(weeks=40),
            enr_end=self.now+timedelta(weeks=50),
        )
        next_run = self.course.get_first_unexpired_run()
        assert isinstance(next_run, CourseRun)
        assert next_run.pk == course_run.pk

    def test_present_enroll_closed_with_future_present(self):
        """
        one run with enrollment past and course present
        and one run with enrollment future and course future
        """
        self.create_run(
            start=self.now-timedelta(weeks=1),
            end=self.now+timedelta(weeks=2),
            enr_start=self.now-timedelta(weeks=10),
            enr_end=self.now-timedelta(weeks=1),
        )
        course_run = self.create_run(
            start=self.now+timedelta(weeks=52),
            end=self.now+timedelta(weeks=62),
            enr_start=self.now+timedelta(weeks=40),
            enr_end=self.now+timedelta(weeks=50),
        )
        next_run = self.course.get_first_unexpired_run()
        assert isinstance(next_run, CourseRun)
        assert next_run.pk == course_run.pk

    def test_future(self):
        """
        enrollment in the future and course in the future
        """
        course_run = self.create_run(
            start=self.now+timedelta(weeks=52),
            end=self.now+timedelta(weeks=62),
            enr_start=self.now+timedelta(weeks=40),
            enr_end=self.now+timedelta(weeks=50),
        )
        next_run = self.course.get_first_unexpired_run()
        assert isinstance(next_run, CourseRun)
        assert next_run.pk == course_run.pk

    def test_enroll_none_course_future(self):
        """
        enrollment none, course future
        """
        course_run = self.create_run(
            start=self.now+timedelta(weeks=1),
            end=self.now+timedelta(weeks=4),
        )
        next_run = self.course.get_first_unexpired_run()
        assert isinstance(next_run, CourseRun)
        assert next_run.pk == course_run.pk

    def test_exclude_course_run(self):
        """
        Two runs, one of which will be excluded from the results.
        """
        course_run_earlier = self.create_run(
            start=self.now-timedelta(days=2),
            end=self.now+timedelta(days=10),
            enr_start=self.now-timedelta(days=1),
            enr_end=self.now+timedelta(days=4),
        )
        course_run_later = self.create_run(
            start=self.now-timedelta(days=1),
            end=self.now+timedelta(days=11),
            enr_start=self.now,
            enr_end=self.now+timedelta(days=5),
        )
        next_run = self.course.get_first_unexpired_run(course_run_to_exclude=course_run_earlier)
        assert isinstance(next_run, CourseRun)
        assert next_run.pk == course_run_later.pk


class CourseTests(CourseModelTests):  # pylint: disable=too-many-public-methods
    """Tests for Courses"""

    def test_to_string(self):
        """Test for __str__ method"""
        assert "{}".format(self.course) == "Title"

    def test_future_course_enr_future(self):
        """Test Course that starts in the future, enrollment in future"""
        future_date = self.now + timedelta(weeks=1)
        start_date = 'Starts {:%D} - '.format(future_date)
        enr_start = 'Enrollment {:%m/%Y}'.format(future_date)
        # create a run that starts soon, enrollment_start in the future
        self.create_run(
            start=future_date,
            end=self.now + timedelta(weeks=10),
            enr_start=future_date,
            enr_end=self.now + timedelta(weeks=2),
        )
        assert self.course.enrollment_text == start_date + enr_start

    def test_future_course_enr_open(self):
        """Test course in the future, enrollment open"""
        future_date = self.now + timedelta(weeks=1)
        start_date = 'Starts {:%D} - Enrollment Open'.format(future_date)
        # and a run is about to start and enrollment is open
        self.create_run(
            start=future_date,
            end=self.now + timedelta(weeks=10),
            enr_start=self.now - timedelta(weeks=1),
            enr_end=self.now + timedelta(weeks=10),
        )
        assert self.course.enrollment_text == start_date

    def test_future_course_no_enr_end(self):
        """Test course in the future, enrollment_end is None"""
        future_date = self.now + timedelta(weeks=1)
        text = 'Starts {:%D} - Enrollment Open'.format(future_date)
        self.create_run(
            start=future_date,
            end=self.now + timedelta(weeks=10),
            enr_start=self.now - timedelta(weeks=1),
        )
        assert self.course.enrollment_text == text

    def test_future_course_no_enr(self):
        """Test course in the future, no enrollment dates"""
        future_date = self.now + timedelta(weeks=1)
        expected_text = 'Starts {:%D}'.format(future_date)
        self.create_run(
            start=future_date,
            end=self.now + timedelta(weeks=10),
            enr_start=None,
            enr_end=None,
        )
        assert self.course.enrollment_text == expected_text

    def test_current_course(self):
        """Test current course, enrollment ends soon"""
        text = 'Ongoing - Enrollment Ends {:%D}'.format(
            self.now + timedelta(weeks=10)
        )
        self.create_run(
            start=self.now - timedelta(weeks=1),
            end=self.now + timedelta(weeks=10),
            enr_start=self.now - timedelta(weeks=1),
            enr_end=self.now + timedelta(weeks=10),
        )
        assert self.course.enrollment_text == text

    def test_current_course_no_enr_end(self):
        """Test current course, enrollment open"""
        self.create_run(
            start=self.now - timedelta(weeks=1),
            end=None,
            enr_start=self.now - timedelta(weeks=1),
            enr_end=None,
        )
        assert self.course.enrollment_text == 'Ongoing - Enrollment Open'

    def test_course_fuzzy_start_date(self):
        """Test course with promised course run"""
        CourseRunFactory.create(
            course=self.course,
            fuzzy_start_date="Fall 2017",
            start_date=None,
            end_date=None,
            enrollment_start=None,
            enrollment_end=None,
        )
        assert self.course.enrollment_text == 'Coming Fall 2017'

    def test_current_course_enr_closed(self):
        """Test current course, enrollment closed"""

        self.create_run(
            start=self.now - timedelta(weeks=1),
            end=self.now + timedelta(weeks=10),
            enr_start=self.now - timedelta(weeks=2),
            enr_end=self.now - timedelta(weeks=1),
        )
        assert self.course.enrollment_text == 'Not available'


class CourseRunTests(CourseModelTests):
    """Tests for Course Run model"""

    def test_to_string(self):
        """Test for __str__ method"""
        course_run = self.create_run()
        assert "{}".format(course_run) == "Title Run"

    def test_save(self):
        """
        Test that save method treats blank and null edx_course_key
        values as null
        """
        test_run = CourseRun.objects.create(
            course=self.course,
            title='test_run'
        )
        test_run_blank_edx_key = CourseRun.objects.create(
            course=self.course,
            title='test_run_blank_edx_key',
            edx_course_key=''
        )
        assert test_run.edx_course_key is None
        assert test_run_blank_edx_key.edx_course_key is None

    def test_is_current_no_start(self):
        """Test for is_current property"""
        course_run = self.create_run()
        assert course_run.is_current is False

        # even if the end is in the future
        course_run = self.create_run(
            end=self.now+timedelta(weeks=1)
        )
        assert course_run.is_current is False

    def test_is_current_no_end(self):
        """Test for is_current property"""
        # with the start in the past
        course_run = self.create_run(
            start=self.now-timedelta(weeks=1)
        )
        assert course_run.is_current is True

        # with the start in the future
        course_run = self.create_run(
            start=self.now+timedelta(weeks=1)
        )
        assert course_run.is_current is False

    def test_is_current(self):
        """Test for is_current property"""
        # with the start and end in the past
        course_run = self.create_run(
            start=self.now-timedelta(weeks=2),
            end=self.now-timedelta(weeks=1)
        )
        assert course_run.is_current is False

        # with the start in the past and end in the future
        course_run = self.create_run(
            start=self.now-timedelta(weeks=2),
            end=self.now+timedelta(weeks=1)
        )
        assert course_run.is_current is True

        # with the start and end in the future
        course_run = self.create_run(
            start=self.now+timedelta(weeks=1),
            end=self.now+timedelta(weeks=2)
        )
        assert course_run.is_current is False

        # with the start in the future and end in the past
        course_run = self.create_run(
            start=self.now+timedelta(weeks=1),
            end=self.now-timedelta(weeks=2)
        )
        assert course_run.is_current is False

    def test_is_past(self):
        """Test for is_past property"""
        # with no end
        course_run = self.create_run()
        assert course_run.is_past is False

        # with end in the future
        course_run = self.create_run(
            end=self.now+timedelta(weeks=2)
        )
        assert course_run.is_past is False

        # with end in the past
        course_run = self.create_run(
            end=self.now-timedelta(weeks=2)
        )
        assert course_run.is_past is True

    def test_is_future(self):
        """Test for is_future property"""
        # with no start
        course_run = self.create_run()
        assert course_run.is_future is False

        # with start in the future
        course_run = self.create_run(
            start=self.now+timedelta(weeks=2)
        )
        assert course_run.is_future is True

        # with start in the past
        course_run = self.create_run(
            start=self.now-timedelta(weeks=2)
        )
        assert course_run.is_future is False

    def test_is_future_enrollment_open(self):
        """Test for is_future_enrollment_open property"""
        # with no start date
        course_run = self.create_run()
        assert course_run.is_future_enrollment_open is False

        # with start in the future, no enrollment_start
        course_run = self.create_run(
            start=self.now + timedelta(weeks=2)
        )
        assert course_run.is_future_enrollment_open is False

        # enrollment_start in the past, no enrollment_end
        course_run = self.create_run(
            start=self.now + timedelta(weeks=2),
            enr_start=self.now - timedelta(weeks=3),
            enr_end=None
        )
        assert course_run.is_future_enrollment_open is True

        # enrollment_start in the past, enrollment_end in the past
        course_run = self.create_run(
            start=self.now + timedelta(weeks=2),
            enr_start=self.now - timedelta(weeks=3),
            enr_end=self.now - timedelta(weeks=1)
        )
        assert course_run.is_future_enrollment_open is False

        # enrollment_start in the past, enrollment_end in the future
        course_run = self.create_run(
            start=self.now + timedelta(weeks=2),
            enr_start=self.now - timedelta(weeks=3),
            enr_end=self.now + timedelta(weeks=3)
        )
        assert course_run.is_future_enrollment_open is True

        # enrollment_start in the future
        course_run = self.create_run(
            start=self.now + timedelta(weeks=2),
            enr_start=self.now + timedelta(weeks=1)
        )
        assert course_run.is_future_enrollment_open is False

    def test_is_upgradable(self):
        """Test for is_upgradable property"""
        # with no upgrade_deadline
        course_run = self.create_run()
        assert course_run.is_upgradable is True

        # with upgrade_deadline in the future
        course_run = self.create_run(
            upgrade_deadline=self.now+timedelta(weeks=2)
        )
        assert course_run.is_upgradable is True

        # with upgrade_deadline in the past
        course_run = self.create_run(
            upgrade_deadline=self.now-timedelta(weeks=2)
        )
        assert course_run.is_upgradable is False
