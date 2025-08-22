from django.core.management.base import BaseCommand
from users.models import Student, Batch

class Command(BaseCommand):
    help = 'Assign students to a batch'

    def add_arguments(self, parser):
        parser.add_argument('batch_id', type=int, help='ID of the batch to assign students to')
        parser.add_argument('--student_ids', nargs='+', type=int, help='List of student IDs to assign to the batch')
        parser.add_argument('--all', action='store_true', help='Assign all unassigned students to the batch')

    def handle(self, *args, **options):
        batch_id = options['batch_id']
        student_ids = options.get('student_ids', [])
        assign_all = options.get('all', False)

        try:
            batch = Batch.objects.get(id=batch_id)
        except Batch.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Batch with ID {batch_id} does not exist'))
            return

        if assign_all:
            # Assign all unassigned students
            students = Student.objects.filter(batch__isnull=True)
            count = students.count()
            students.update(batch=batch)
            self.stdout.write(self.style.SUCCESS(f'Successfully assigned {count} students to batch {batch.name}'))
        elif student_ids:
            # Assign specific students
            students = Student.objects.filter(id__in=student_ids)
            count = students.count()
            students.update(batch=batch)
            self.stdout.write(self.style.SUCCESS(f'Successfully assigned {count} students to batch {batch.name}'))
        else:
            self.stdout.write(self.style.WARNING('No students specified. Use --student_ids or --all option.'))