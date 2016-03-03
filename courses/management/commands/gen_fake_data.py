"""
Generates fake data
"""
from random import randint
from django.core.management import BaseCommand

from courses.factories import ProgramFactory, CourseFactory


class Command(BaseCommand):
    """
    Generates fake data
    """
    help = "Generates fake data"

    def add_arguments(self, parser):
        parser.add_argument(
            '--programs',
            dest='programs',
            default=5,
            help='Number of programs to generate',
        )

        parser.add_argument(
            '--courses',
            dest='courses',
            default=3,
            help='Number of courses to generate (per program)',
        )

    def handle(self, *args, **options):
        record_count = 0
        for _ in range(int(options['programs'])):
            program = ProgramFactory.create()
            record_count += 1
            module_range = range(randint(1, int(options['courses'])))
            for _ in module_range:
                record_count += 1
                CourseFactory.create(program=program)

        self.stdout.write("Wrote {} records.".format(record_count))
