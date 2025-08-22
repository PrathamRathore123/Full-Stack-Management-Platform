from django.core.management.base import BaseCommand
from users.models import Student, Batch
from datetime import datetime

class Command(BaseCommand):
    help = 'Update admission dates for students based on batch'

    def handle(self, *args, **options):
        # Update batch 4-6 to 01/06/2024
        batch_4_to_6 = Batch.objects.filter(name__in=['Batch - 4', 'Batch - 5', 'Batch - 6'])
        june_date = datetime.strptime('01/06/2024', '%d/%m/%Y').date()
        
        students_4_to_6 = Student.objects.filter(batch__in=batch_4_to_6)
        students_4_to_6.update(admission_date=june_date)
        self.stdout.write(self.style.SUCCESS(f'Updated {students_4_to_6.count()} students in batches 4-6'))
        
        # Update batch 1-2 to 01/01/2024
        batch_1_to_2 = Batch.objects.filter(name__in=['Batch - 1', 'Batch - 2'])
        jan_date = datetime.strptime('01/01/2024', '%d/%m/%Y').date()
        
        students_1_to_2 = Student.objects.filter(batch__in=batch_1_to_2)
        students_1_to_2.update(admission_date=jan_date)
        self.stdout.write(self.style.SUCCESS(f'Updated {students_1_to_2.count()} students in batches 1-2'))
        
        # Update all other batches to 01/07/2024
        other_batches = Batch.objects.exclude(name__in=['Batch - 1', 'Batch - 2', 'Batch - 4', 'Batch - 5', 'Batch - 6'])
        july_date = datetime.strptime('01/07/2024', '%d/%m/%Y').date()
        
        other_students = Student.objects.filter(batch__in=other_batches)
        other_students.update(admission_date=july_date)
        self.stdout.write(self.style.SUCCESS(f'Updated {other_students.count()} students in other batches'))