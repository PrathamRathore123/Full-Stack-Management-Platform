from django.core.management.base import BaseCommand
from users.models import Student, Attendance, Holiday
from datetime import datetime, timedelta, date
import random

class Command(BaseCommand):
    help = 'Generate attendance records for students'

    def handle(self, *args, **options):
        students = Student.objects.all()
        
        if not students:
            self.stdout.write(self.style.ERROR('No students found'))
            return
            
        # Get holidays
        holidays = Holiday.objects.all()
        holiday_dates = [h.date for h in holidays]
        
        # Generate attendance for the last 30 days
        today = date.today()
        start_date = today - timedelta(days=30)
        
        total_created = 0
        
        for student in students:
            # Skip dates before admission date
            student_start = max(start_date, student.admission_date)
            
            # Generate attendance for each day
            current_date = student_start
            while current_date <= today:
                # Skip weekends (5=Saturday, 6=Sunday) and holidays
                if current_date.weekday() < 5 and current_date not in holiday_dates:
                    # Check if attendance already exists
                    if not Attendance.objects.filter(student=student, date=current_date).exists():
                        # 80% chance of being present
                        is_present = random.random() < 0.8
                        
                        Attendance.objects.create(
                            student=student,
                            date=current_date,
                            is_present=is_present
                        )
                        total_created += 1
                
                current_date += timedelta(days=1)
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {total_created} attendance records'))