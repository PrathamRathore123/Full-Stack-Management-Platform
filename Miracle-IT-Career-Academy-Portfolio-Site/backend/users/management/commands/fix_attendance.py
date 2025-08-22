from django.core.management.base import BaseCommand
from users.models import Student, Attendance, Holiday
from datetime import date, timedelta

class Command(BaseCommand):
    help = 'Fix attendance records and ensure working days are properly calculated'

    def handle(self, *args, **options):
        students = Student.objects.all()
        today = date.today()
        
        # Get all holidays
        holidays = Holiday.objects.all()
        holiday_dates = [h.date for h in holidays]
        
        total_fixed = 0
        
        for student in students:
            admission_date = student.admission_date
            
            # Calculate working days (excluding Sundays and holidays)
            working_days = []
            current_date = admission_date
            while current_date <= today:
                # Skip Sundays (weekday 6) and holidays
                if current_date.weekday() != 6 and current_date not in holiday_dates:
                    working_days.append(current_date)
                current_date += timedelta(days=1)
            
            # Check if we have attendance records for each working day
            for work_day in working_days:
                # Check if attendance record exists for this day
                attendance_exists = Attendance.objects.filter(student=student, date=work_day).exists()
                
                if not attendance_exists:
                    # Create attendance record with default present=True
                    Attendance.objects.create(
                        student=student,
                        date=work_day,
                        is_present=True
                    )
                    total_fixed += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully fixed {total_fixed} attendance records'))