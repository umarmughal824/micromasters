"""
Admin views for Dashboard
"""

from django.contrib import admin

from dashboard.models import ProgramEnrollment


class ProgramEnrollmentAdmin(admin.ModelAdmin):
    """ModelAdmin for ProgramEnrollment"""
    list_display = ('user', 'program',)
    list_filter = ('program', 'program__live',)

admin.site.register(ProgramEnrollment, ProgramEnrollmentAdmin)
