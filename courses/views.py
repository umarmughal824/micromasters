"""Views for courses"""
from rest_framework import viewsets
from courses.models import CourseRun, Program
from courses.serializers import CourseRunSerializer, ProgramSerializer


class ProgramViewSet(viewsets.ReadOnlyModelViewSet):
    """API for the Program collection"""
    queryset = Program.objects.filter(live=True)
    serializer_class = ProgramSerializer


class CourseRunViewSet(viewsets.ReadOnlyModelViewSet):
    """API for the Program collection"""
    queryset = CourseRun.objects.filter(course__program__live=True)
    serializer_class = CourseRunSerializer
