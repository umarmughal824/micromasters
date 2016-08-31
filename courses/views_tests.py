"""Tests for the API"""
# pylint: disable=no-self-use
from collections import OrderedDict

from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from courses.factories import ProgramFactory, CourseFactory
from courses.serializers import ProgramSerializer
from dashboard.factories import ProgramEnrollmentFactory
from dashboard.models import ProgramEnrollment
from profiles.factories import UserFactory
from search.base import ESTestCase
from rest_framework.status import HTTP_409_CONFLICT


class ProgramTests(ESTestCase):
    """Tests for the Program API"""
    def test_lists_live_programs(self):
        """Live programs should show up"""
        prog = ProgramFactory.create(live=True)

        resp = self.client.get(reverse('programs-list'))

        assert len(resp.json) == 1
        assert prog.title == resp.json[0]['title']

    def test_doesnt_list_unlive_programs(self):
        """Not-live programs should NOT show up"""
        ProgramFactory.create(live=False)

        resp = self.client.get(reverse('programs-list'))

        assert len(resp.json) == 0


class CourseTests(ESTestCase):
    """Tests for the Course API"""
    def test_list_course_if_program_live(self):
        """
        If the course belongs to a live program, show it.
        """
        course = CourseFactory.create(program__live=True)

        resp = self.client.get(reverse('course-list'))

        assert len(resp.json) == 1
        assert resp.json[0]['id'] == course.id

    def test_doesnt_list_courses_from_unlive_programs(self):
        """
        If the course belongs to a non-live program, hide it.
        """
        CourseFactory.create(program__live=False)

        resp = self.client.get(reverse('course-list'))

        assert len(resp.json) == 0


class ProgramEnrollmentTests(ESTestCase, APITestCase):
    """Tests for the ProgramEnrollment API"""

    @classmethod
    def setUpTestData(cls):
        super(ProgramEnrollmentTests, cls).setUpTestData()

        cls.user1 = UserFactory.create()
        cls.user2 = UserFactory.create()
        cls.program1 = ProgramFactory.create(live=True)
        cls.program2 = ProgramFactory.create(live=True)
        cls.program3 = ProgramFactory.create(live=True)
        for program in (cls.program1, cls.program2,):
            ProgramEnrollmentFactory(
                user=cls.user1,
                program=program,
            )
        cls.url = reverse('user_program_enrollments')

    def setUp(self):
        super(ProgramEnrollmentTests, self).setUp()
        for program in (self.program1, self.program2,):
            ProgramEnrollmentFactory(
                user=self.user1,
                program=program,
            )
        self.client.force_login(self.user1)

    def tearDown(self):
        super(ProgramEnrollmentTests, self).tearDown()
        ProgramEnrollment.objects.all().delete()

    def test_anonymous(self):
        """Anonymous user cannot access the endpoint"""
        self.client.logout()
        resp = self.client.get(self.url)
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_no_enrollments(self):
        """Requests for a user with no program enrollments result in an empty list"""
        self.client.logout()
        self.client.force_login(self.user2)
        resp = self.client.get(self.url)
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data == []

    def test_enrollments(self):
        """Only the programs where the user is enrolled in are returned"""
        resp = self.client.get(self.url)
        assert resp.status_code == status.HTTP_200_OK
        expected_enrollments_ids = [
            program.pk for program in (self.program1, self.program2,)
        ]
        for enr in resp.data:
            assert enr.get('id') in expected_enrollments_ids

    def test_crete_no_program_id(self):
        """Missing mandatory program_id parameter"""
        resp = self.client.post(self.url, {}, format='json')
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_crete_invalid_program_id(self):
        """program_id parameter must be an integer"""
        resp = self.client.post(self.url, {'program_id': 'foo'}, format='json')
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_crete_enrollment_exists(self):
        """Test in case the enrollment is already there"""
        resp = self.client.post(self.url, {'program_id': self.program1.pk}, format='json')
        assert resp.status_code == status.HTTP_409_CONFLICT

    def test_crete_program_does_not_exists(self):
        """Test in case the program does not exist"""
        resp = self.client.post(self.url, {'program_id': 1234567}, format='json')
        assert resp.status_code == status.HTTP_404_NOT_FOUND

    def test_crete_program_not_live(self):
        """Test in case the program is not live"""
        program = ProgramFactory.create(live=False)
        resp = self.client.post(self.url, {'program_id': program.pk}, format='json')
        assert resp.status_code == status.HTTP_404_NOT_FOUND

    def test_crete(self):
        """Test for happy path"""
        resp = self.client.post(self.url, {'program_id': self.program3.pk}, format='json')
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data.get('id') == self.program3.pk
