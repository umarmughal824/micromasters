"""Views for courses"""
from rest_framework import viewsets
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

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


class ProgramEnrollmentListView(ListAPIView):
    """API for the User Program Enrollments"""

    serializer_class = ProgramSerializer
    permission_classes = (
        IsAuthenticated,
    )

    def get_queryset(self):
        """
        Filter programs by the user enrollment
        """
        queryset = Program.objects.filter(programenrollment__user=self.request.user)
        return queryset.order_by('title')
