"""URLs for dashboard"""
from django.conf.urls import url

from dashboard.views import (
    UserCourseEnrollment,
    UserDashboard,
    UserPaymentStatus,
)

urlpatterns = [
    url(r'^api/v0/dashboard/(?P<username>[-\w.]+)/$', UserDashboard.as_view(), name='dashboard_api'),
    url(r'^api/v0/course_enrollments/$', UserCourseEnrollment.as_view(), name='user_course_enrollments'),
    url(r'^api/v0/program_has_payment/$', UserPaymentStatus.as_view(), name='user_program_payment'),
]
