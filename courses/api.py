"""API Handlers"""
from rest_framework import viewsets, serializers
from .models import Program, Course


class ProgramSerializer(serializers.ModelSerializer):
    """Serializer for Program objects"""
    class Meta:  # pylint: disable=missing-docstring
        model = Program
        fields = ('id', 'title',)


class ProgramViewSet(viewsets.ReadOnlyModelViewSet):
    """API for the Program collection"""
    queryset = Program.objects.filter(live=True)
    serializer_class = ProgramSerializer


class CourseSerializer(serializers.ModelSerializer):
    """Serializer for Program objects"""
    class Meta:  # pylint: disable=missing-docstring
        model = Course
        exclude = ('edx_course_key',)


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """API for the Program collection"""
    queryset = Course.objects.filter(program__live=True)
    serializer_class = CourseSerializer
