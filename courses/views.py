"""Views for courses"""
from django.db import transaction
from rest_framework import (
    viewsets,
    status,
)
from rest_framework.exceptions import (
    APIException,
    NotFound,
    ValidationError,
)
from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


from courses.models import (
    CourseRun,
    Program,
)
from courses.serializers import (
    CourseRunSerializer,
    ProgramSerializer,
)
from dashboard.models import ProgramEnrollment


class ResourceConflict(APIException):
    """Custom exception for Conflict Status Code"""
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'The resource already exists.'


class ProgramViewSet(viewsets.ReadOnlyModelViewSet):
    """API for the Program collection"""
    queryset = Program.objects.filter(live=True)
    serializer_class = ProgramSerializer


class CourseRunViewSet(viewsets.ReadOnlyModelViewSet):
    """API for the Program collection"""
    queryset = CourseRun.objects.filter(course__program__live=True)
    serializer_class = CourseRunSerializer


class ProgramEnrollmentListView(ListCreateAPIView):
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

    @transaction.atomic
    def create(self, request, *args, **kwargs):  # noqa pylint: disable=unused-argument
        """
        Create an enrollment for the current user
        """
        program_id = request.data.get('program_id')
        if not isinstance(program_id, int):
            raise ValidationError('A `program_id` parameter must be specified')

        if ProgramEnrollment.objects.filter(user=request.user, program__pk=program_id).exists():
            raise ResourceConflict('The enrollment for the specified program already exists')

        program_queryset = Program.objects.filter(live=True, pk=program_id)
        if not program_queryset.exists():
            raise NotFound('The specified program has not been found or it is not live yet')

        program = program_queryset.first()
        ProgramEnrollment.objects.create(
            user=request.user,
            program=program,
        )
        serializer = self.get_serializer_class()
        return Response(serializer(program).data)
