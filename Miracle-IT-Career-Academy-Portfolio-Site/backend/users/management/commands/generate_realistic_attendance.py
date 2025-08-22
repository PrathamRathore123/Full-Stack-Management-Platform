from django.core.management.base import BaseCommand
from users.models import Student, Attendance, Holiday
from datetime import datetime, timedelta, date
import random

class Command(BaseCommand):
    help = 'Generate realistic attendance records for students'

    def handle(self, *args, **options):
        students = Student.objects.all()
        
        if not students:
            self.stdout.write(self.style.ERROR('No students found'))
            return
            
        # Get holidays
        holidays = Holiday.objects.all()
        holiday_dates = [h.date for h in holidays]
        
        # Define date range
        start_date = datetime.strptime('2024-06-01', '%Y-%m-%d').date()
        end_date = datetime.strptime('2024-07-01', '%Y-%m-%d').date()
        
        # Clear existing attendance records in this date range
        deleted = Attendance.objects.filter(date__gte=start_date, date__lte=end_date).delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {deleted[0]} existing attendance records'))
        
        total_created = 0
        
        for student in students:
            # Skip dates before admission date
            student_start = max(start_date, student.admission_date)
            
            # Generate attendance for each day
            current_date = student_start
            while current_date <= end_date:
                # Skip weekends (5=Saturday, 6=Sunday) and holidays
                if current_date.weekday() != 6 and current_date not in holiday_dates:
                    # Random attendance pattern - 85% chance of being present
                    is_present = random.random() < 0.85
                    
                    # Create attendance record
                    Attendance.objects.create(
                        student=student,
                        date=current_date,
                        is_present=is_present
                    )
                    total_created += 1
                
                current_date += timedelta(days=1)
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {total_created} attendance records'))