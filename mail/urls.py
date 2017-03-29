"""URLs for mail app"""
from django.conf.urls import url

from mail.views import (
    LearnerMailView,
    FinancialAidMailView,
    SearchResultMailView,
    CourseTeamMailView,
    AutomaticEmailView,
)

urlpatterns = [
    url(r'^api/v0/financial_aid_mail/(?P<financial_aid_id>[\d]+)/$', FinancialAidMailView.as_view(),
        name='financial_aid_mail_api'),
    url(r'^api/v0/mail/search/$', SearchResultMailView.as_view(), name='search_result_mail_api'),
    url(r'^api/v0/mail/course/(?P<course_id>[\d]+)/$', CourseTeamMailView.as_view(), name='course_team_mail_api'),
    url(r'^api/v0/mail/learner/(?P<student_id>[\d]+)/$', LearnerMailView.as_view(), name='learner_mail_api'),
    url(r'^api/v0/mail/automatic_email/$', AutomaticEmailView.as_view(), name='automatic_email_api'),
]
