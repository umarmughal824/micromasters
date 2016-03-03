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
    An individual course within a Program, e.g. "Supply Chain 101"
    """
    title = models.CharField(max_length=255)
    edx_course_key = models.CharField(max_length=255, blank=True, null=True)
    enrollment_start = models.DateTimeField(blank=True, null=True)
    start_date = models.DateTimeField(blank=True, null=True)
    enrollment_url = models.URLField(blank=True, null=True)
    prerequisites = models.TextField(blank=True, null=True)
    program = models.ForeignKey(Program)

    def __str__(self):
        return self.title
