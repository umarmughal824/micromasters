"""
Serializers for courses
"""
from rest_framework import serializers

from courses.models import CourseRun, Program


class ProgramSerializer(serializers.ModelSerializer):
    """Serializer for Program objects"""
    class Meta:  # pylint: disable=missing-docstring
        model = Program
        fields = ('id', 'title',)


class CourseRunSerializer(serializers.ModelSerializer):
    """Serializer for CourseRun objects"""
    class Meta:  # pylint: disable=missing-docstring
        model = CourseRun
        exclude = ('edx_course_key',)
