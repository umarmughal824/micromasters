"""
Deletes a set of realistic users/programs that were added to help us test search functionality
"""
from django.core.management import BaseCommand
from django.contrib.auth.models import User
from courses.models import Program
from profiles.management.commands.gen_realistic_search_data import FAKE_PROGRAM_DESC_PREFIX, FAKE_USER_USERNAME_PREFIX


class Command(BaseCommand):
    """
    Deletes a set of realistic users and programs/courses that were generated to help us test search
    """
    help = "Deletes a set of realistic users and programs/courses that were generated to help us test search"

    def handle(self, *args, **options):
        User.objects.filter(username__startswith=FAKE_USER_USERNAME_PREFIX).delete()
        Program.objects.filter(description__startswith=FAKE_PROGRAM_DESC_PREFIX).delete()
