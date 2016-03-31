"""
Models for course structure
"""
from django.db import models


class Program(models.Model):
    """
    A degree someone can pursue, e.g. "Supply Chain Management"
    """
    title = models.CharField(max_length=255)
    live = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class Course(models.Model):
    """
    A logical representation of a course, such as "Supply Chain Management
    101". This won't have associated dates or any specific information about a
    given course instance (aka course run), but rather only the things that are
    general across multiple course runs.
    """
    program = models.ForeignKey(Program)

    # These fields will likely make their way into the CMS at some point.
    title = models.CharField(max_length=255)
    thumbnail = models.ImageField(null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    prerequisites = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title


class CourseRun(models.Model):
    """
    An individual run of a course within a Program, e.g. "Supply Chain 101
    - Summer 2017". This is different than the logical notion of a course, but
      rather a specific instance of that course being taught.
    """
    title = models.CharField(max_length=255)
    edx_course_key = models.CharField(max_length=255, blank=True, null=True)
    enrollment_start = models.DateTimeField(blank=True, null=True)
    start_date = models.DateTimeField(blank=True, null=True)
    fuzzy_start_date = models.CharField(
        max_length=255, blank=True, null=True,
        help_text="If you don't know when your course will run exactly, "
        "put something here like 'Fall 2019'.")
    enrollment_url = models.URLField(blank=True, null=True)
    prerequisites = models.TextField(blank=True, null=True)
    course = models.ForeignKey(Course, null=True)

    def __str__(self):
        return self.title
