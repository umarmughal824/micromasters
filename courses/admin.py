"""Admin views for Courses & Programs"""
from django.contrib import admin
from .models import Course, Program


class ProgramAdmin(admin.ModelAdmin):
    """ModelAdmin for Programs"""
    list_display = ('title', 'live',)
    list_filter = ('live',)


class CourseAdmin(admin.ModelAdmin):
    """ModelAdmin for Courses"""
    list_display = ('title', 'program',)
    list_filter = ('program__live',)


admin.site.register(Course, CourseAdmin)
admin.site.register(Program, ProgramAdmin)
