"""Tests for the API"""
# pylint: disable=no-self-use
from collections import OrderedDict

from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from courses.factories import ProgramFactory, CourseFactory
from courses.serializers import ProgramSerializer
from dashboard.factories import ProgramEnrollmentFactory
from profiles.factories import UserFactory
from search.base import ESTestCase


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
        cls.url = reverse('user_program_enrollment')

    def test_anonymous(self):
        """Anonymous user cannot access the endpoint"""
        resp = self.client.get(self.url)
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_no_enrollments(self):
        """Requests for a user with no program enrollments result in an empty list"""
        self.client.force_login(self.user2)
        resp = self.client.get(self.url)
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data == []

    def test_enrollments(self):
        """Only the programs where the user is enrolled in are returned"""
        self.client.force_login(self.user1)
        resp = self.client.get(self.url)
        assert resp.status_code == status.HTTP_200_OK
        expected_data = sorted(
            [
                OrderedDict(sorted(program.data.items(), key=lambda t: t[0]))
                for program in (ProgramSerializer(self.program1), ProgramSerializer(self.program2),)
            ],
            key=lambda x: x['title'],
        )
        assert resp.data == expected_data
