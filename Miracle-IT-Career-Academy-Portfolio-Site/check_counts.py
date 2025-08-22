import os
import django
import sys

# Set up Django environment
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Import models
from users.models import Student, Batch
from courses.models import Course

# Check course student counts
print('\nCOURSE STUDENT COUNTS:')
for course in Course.objects.all():
    student_count = Student.objects.filter(course=course).count()
    print(f'Course ID: {course.id}, Title: {course.title}, Students: {student_count}')

# Check batch student counts
print('\nBATCH STUDENT COUNTS:')
for batch in Batch.objects.all():
    student_count = Student.objects.filter(batch=batch).count()
    print(f'Batch ID: {batch.id}, Name: {batch.name}, Students: {student_count}')