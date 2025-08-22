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

# Fix course assignments for students in batches
print('\nFIXING COURSE ASSIGNMENTS:')

# Get all batches
batches = Batch.objects.all()
for batch in batches:
    # Get the course associated with this batch
    course = batch.course
    if not course:
        print(f"Batch {batch.id} ({batch.name}) has no associated course, skipping...")
        continue
        
    # Get all students in this batch
    students = Student.objects.filter(batch=batch)
    print(f"Batch {batch.id} ({batch.name}) has {students.count()} students")
    
    # Update each student to have the same course as their batch
    updated_count = 0
    for student in students:
        if student.course != course:
            student.course = course
            student.save()
            updated_count += 1
    
    print(f"Updated {updated_count} students in batch {batch.id} to have course {course.id} ({course.title})")

# Check results after fixing
print('\nAFTER FIXING - COURSE STUDENT COUNTS:')
for course in Course.objects.all():
    student_count = Student.objects.filter(course=course).count()
    print(f'Course ID: {course.id}, Title: {course.title}, Students: {student_count}')

print('\nAFTER FIXING - BATCH STUDENT COUNTS:')
for batch in Batch.objects.all():
    student_count = Student.objects.filter(batch=batch).count()
    print(f'Batch ID: {batch.id}, Name: {batch.name}, Students: {student_count}')