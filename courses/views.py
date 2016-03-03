"""Views for courses"""
from rest_framework import viewsets
from courses.models import Course, Program
from courses.serializers import CourseSerializer, ProgramSerializer


class ProgramViewSet(viewsets.ReadOnlyModelViewSet):
    """API for the Program collection"""
    queryset = Program.objects.filter(live=True)
    serializer_class = ProgramSerializer


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """API for the Program collection"""
    queryset = Course.objects.filter(program__live=True)
    serializer_class = CourseSerializer
