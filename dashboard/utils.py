"""
Utility functions and classes for the dashboard
"""
import logging
from decimal import Decimal

from datetime import datetime
from django.db import transaction
from django.db.models import Q
from pytz import utc

from courses.models import CourseRun
from dashboard.api_edx_cache import CachedEdxUserData
from ecommerce.models import Line
from grades.constants import FinalGradeStatus
from grades.models import FinalGrade
from exams.models import ExamProfile, ExamAuthorization


log = logging.getLogger(__name__)


class MMTrack:
    """
    Abstraction around the user status in courses.
    Needed because the user enrollment "verified" and user passed status
    can be checked in different ways depending on if the program offers financial aid or not.
    """
    # pylint: disable=too-many-instance-attributes, too-many-arguments

    user = None
    program = None
    enrollments = None
    current_grades = None
    certificates = None
    course_ids = set()
    paid_course_ids = set()  # financial aid course ids for paid with the MM app
    pearson_exam_status = None

    def __init__(self, user, program, edx_user_data):
        """
        Args:
            user (User): a Django user
            program (programs.models.Program): program where the user is enrolled
            edx_user_data (dashboard.api_edx_cache.CachedEdxUserData): A CachedEdxUserData object
        """
        self.now = datetime.now(utc)
        self.user = user
        self.program = program
        self.enrollments = edx_user_data.enrollments
        self.current_grades = edx_user_data.current_grades
        self.certificates = edx_user_data.certificates
        self.financial_aid_available = program.financial_aid_availability

        with transaction.atomic():
            # Maps a CourseRun's edx_course_key to its parent Course id
            self.edx_key_course_map = dict(
                CourseRun.objects.filter(course__program=program).exclude(
                    Q(edx_course_key__isnull=True) | Q(edx_course_key__exact='')
                ).values_list("edx_course_key", "course__id")
            )
            self.course_ids = self.edx_key_course_map.keys()

            if self.financial_aid_available:
                self.paid_course_ids = set(Line.objects.filter(
                    Q(order__status='fulfilled') & Q(course_key__in=self.course_ids) & Q(order__user=user)
                ).values_list("course_key", flat=True))

    def __str__(self):
        return 'MMTrack for user {0} on program "{1}"'.format(
            self.user.username,
            self.program.title
        )

    def _is_course_in_program(self, course_id):
        """
        Returns whether the course id belongs to the program
        """
        return course_id in self.course_ids

    def is_enrolled(self, course_id):
        """
        Returns whether the user is enrolled at least audit in a course run.

        Args:
            course_id (str): an edX course run id

        Returns:
            bool: whether the user is enrolled audit in the course
        """
        return self._is_course_in_program(course_id) and self.enrollments.is_enrolled_in(course_id)

    def is_enrolled_mmtrack(self, course_id):
        """
        Returns whether an used is enrolled mmtrack in a course run.
        This means if the user is enrolled verified for normal programs
        or enrolled and paid on micromasters for financial aid ones.

        Args:
            course_id (str): an edX course run id

        Returns:
            bool: whether the user is enrolled mmtrack in the course
        """
        return self.is_enrolled(course_id) and self.has_paid(course_id)

    def has_paid(self, course_id):
        """
        Returns true if user paid for a course.

        Args:
            course_id (str): an edX course run id

        Returns:
            bool: whether the user is paid
        """
        if self.has_paid_final_grade(course_id):
            return True

        # financial aid programs need to have an audit enrollment and a paid entry for the course
        if self.financial_aid_available:
            return course_id in self.paid_course_ids

        # normal programs need to have a verified enrollment
        return self.has_verified_enrollment(course_id)

    def has_verified_enrollment(self, course_id):
        """
        Returns true if user has a verified enrollment

        Args:
            course_id (str): an edX course run id

        Returns:
            bool: whether the user has a verified enrollment
        """
        enrollment = self.enrollments.get_enrollment_for_course(course_id)
        return bool(enrollment and enrollment.is_verified)

    def has_passing_certificate(self, course_id):
        """
        Returns whether the user has a passing certificate.

        Args:
            course_id (str): An edX course key
        Returns:
            bool: whether the user has a passing certificate meaning that the user passed the course on edX
        """
        if not self.certificates.has_verified_cert(course_id):
            return False
        certificate = self.certificates.get_verified_cert(course_id)
        return certificate.status == 'downloadable'

    @property
    def final_grade_qset(self):
        """Base queryset for the MMTrack User's completed FinalGrades"""
        return FinalGrade.objects.filter(user=self.user, status=FinalGradeStatus.COMPLETE)

    def get_final_grade(self, course_id):
        """
        Gets a user's FinalGrade for a CourseRun matching a course run key

        Args:
            course_id (str): an edX course run id
        Returns:
            FinalGrade: a Final Grade object or None
        """
        return self.final_grade_qset.for_course_run_key(course_id).first()

    def get_required_final_grade(self, course_id):
        """
        Gets a user's FinalGrade for a CourseRun matching a course run key. This should be used
        in cases where a user is expected to have a FinalGrade for the given CourseRun.

        Args:
            course_id (str): an edX course run id
        Raises:
            FinalGrade.DoesNotExist: raised if a FinalGrade record was not found
        Returns:
            FinalGrade: a Final Grade object
        """
        return self.final_grade_qset.for_course_run_key(course_id).get()

    def has_final_grade(self, course_id):
        """
        Checks if there is a final grade for the course run

        Args:
            course_id (str): an edX course run id
        Returns:
            bool: whether a frozen final grade exists
        """
        return self.final_grade_qset.for_course_run_key(course_id).exists()

    def has_paid_final_grade(self, course_id):
        """
        Checks if there is a a frozen final grade and the user paid for it.

        Args:
            course_id (str): an edX course run id
        Returns:
            bool: whether a frozen final grade exists
        """
        return self.final_grade_qset.paid_on_edx().for_course_run_key(course_id).exists()

    def has_passed_course(self, course_id):
        """
        Returns whether the user has passed a course run.

        Args:
            course_id (str): an edX course run id
        Returns:
            bool: whether the user has passed the course
        """
        final_grade = self.get_final_grade(course_id)
        return final_grade.passed if final_grade else False

    def get_final_grade_percent(self, course_id):
        """
        Returns the course final grade number for the user if she passed.

        Args:
            course_id (str): an edX course run id
        Returns:
            float: the final grade of the user in the course
        """
        final_grade = self.get_final_grade(course_id)
        return final_grade.grade_percent if final_grade else None

    def calculate_final_grade_average(self):
        """
        Calculates an average grade (integer) from the program final grades
        """
        final_grades = self.final_grade_qset.for_course_run_keys(self.course_ids)
        if final_grades:
            return round(
                sum(Decimal(final_grade.grade_percent) for final_grade in final_grades) /
                len(final_grades)
            )

    def get_current_grade(self, course_id):
        """
        Returns the current grade number for the user in the course if enrolled.

        Args:
            course_id (str): an edX course run id
        Returns:
            float: the current grade of the user in the course
        """
        if not self.is_enrolled(course_id):
            return
        current_grade = self.current_grades.get_current_grade(course_id)
        if current_grade is None:
            return
        return float(current_grade.percent) * 100

    def count_courses_passed(self):
        """
        Calculates number of passed courses in program.

        Returns:
            int: A number of passed courses.
        """
        return (
            self.final_grade_qset.for_course_run_keys(self.course_ids).passed()
            .values_list('course_run__course__id', flat=True)
            .distinct().count()
        )

    def get_pearson_exam_status(self):  # pylint: disable=too-many-return-statements
        """
        Get the pearson exam status for the user / program combo

        Returns:
            str: description of Pearson profile status
        """

        course_runs_for_program = CourseRun.objects.filter(
            course__program=self.program
        ).select_related('course__program').only('course', 'edx_course_key')

        if not any(course_run.has_exam for course_run in course_runs_for_program):
            return ""

        user = self.user
        try:
            exam_profile = ExamProfile.objects.only('status').get(profile=user.profile)
        except ExamProfile.DoesNotExist:
            return ExamProfile.PROFILE_ABSENT

        if exam_profile.status in (ExamProfile.PROFILE_PENDING, ExamProfile.PROFILE_IN_PROGRESS,):
            return ExamProfile.PROFILE_IN_PROGRESS

        elif exam_profile.status in (ExamProfile.PROFILE_INVALID, ExamProfile.PROFILE_FAILED,):
            return ExamProfile.PROFILE_INVALID

        elif exam_profile.status == ExamProfile.PROFILE_SUCCESS:
            auths = ExamAuthorization.objects.filter(
                user=user,
                status=ExamAuthorization.STATUS_SUCCESS,
                date_first_eligible__lte=self.now.date(),
                date_last_eligible__gte=self.now.date(),
            )

            if auths.exists():
                return ExamProfile.PROFILE_SCHEDULABLE
            else:
                return ExamProfile.PROFILE_SUCCESS

        else:
            log.error(
                'Unexpected ExamProfile status for ExamProfile %s',
                exam_profile.id
            )
            return ExamProfile.PROFILE_INVALID


def get_mmtrack(user, program):
    """
    Creates mmtrack object for given user.

    Args:
        user (User): a Django user.
        program (programs.models.Program): program where the user is enrolled.

    Returns:
        mmtrack (dashboard.utils.MMTrack): a instance of all user information about a program
    """
    edx_user_data = CachedEdxUserData(user, program=program)
    return MMTrack(
        user,
        program,
        edx_user_data
    )
