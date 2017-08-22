"""
Tests for grades tasks
"""
import pytest
import factory
from courses.factories import CourseFactory
from exams.factories import ExamRunFactory
from grades import tasks
from grades.factories import (
    FinalGradeFactory,
    ProctoredExamGradeFactory,
)
from grades.models import MicromastersCourseCertificate


pytestmark = [
    pytest.mark.usefixtures('mocked_elasticsearch'),
    pytest.mark.django_db,
]


def test_generate_course_certificates():
    """
    Test that generate_course_certificates_for_fa_students creates certificates for appropriate FinalGrades
    """
    course = CourseFactory.create(program__financial_aid_availability=True)
    course_with_exams = ExamRunFactory.create(course__program__financial_aid_availability=True).course
    non_fa_course = CourseFactory.create(program__financial_aid_availability=False)
    # Create FinalGrade records with different courses and a mix of passed and failed outcomes
    passed_final_grades = FinalGradeFactory.create_batch(4, course_run__course=course, passed=True)
    passed_final_grades_with_exam = FinalGradeFactory.create_batch(
        4,
        course_run__course=course_with_exams,
        passed=True
    )
    FinalGradeFactory.create(course_run__course=non_fa_course, passed=True)
    FinalGradeFactory.create(course_run__course=course, passed=False)
    # Create ProctoredExamGrade records with a mix of passed and failed outcomes
    final_grades_with_passed_exam = passed_final_grades_with_exam[:2]
    final_grades_with_failed_exam = passed_final_grades_with_exam[2:]
    ProctoredExamGradeFactory.create_batch(
        2,
        user=factory.Iterator([final_grade.user for final_grade in final_grades_with_passed_exam]),
        course=course_with_exams,
        passed=True,
    )
    ProctoredExamGradeFactory.create_batch(
        2,
        user=factory.Iterator([final_grade.user for final_grade in final_grades_with_failed_exam]),
        course=course_with_exams,
        passed=False,
    )

    tasks.generate_course_certificates_for_fa_students.delay()

    # Make sure that certificates were created only for passed FinalGrades that either had no course exam, or had
    # a passed ProctoredExamGrade.
    created_certificates = MicromastersCourseCertificate.objects.all()
    assert len(created_certificates) == 6
    certificate_grade_ids = set([certificate.final_grade.id for certificate in created_certificates])
    expected_certificate_final_grades = passed_final_grades + final_grades_with_passed_exam
    assert certificate_grade_ids == set([final_grade.id for final_grade in expected_certificate_final_grades])
