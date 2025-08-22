#!/usr/bin/env python
"""
Script to assign fee structures to existing students based on their enrolled courses.
Run this script to ensure all students have proper fee structures assigned.
"""

import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import Student, FeeStructure, StudentFee
from courses.models import Course

def assign_fee_structures():
    """Assign fee structures to students who don't have them"""
    
    print("Starting fee structure assignment...")
    
    # Get all students
    students = Student.objects.all()
    print(f"Found {students.count()} students")
    
    assigned_count = 0
    skipped_count = 0
    error_count = 0
    
    for student in students:
        try:
            # Check if student already has a fee structure assigned
            existing_fee = StudentFee.objects.filter(student=student).first()
            
            if existing_fee:
                print(f"Student {student.enrollment_id} already has fee structure assigned - skipping")
                skipped_count += 1
                continue
            
            # Check if student has a course assigned
            if not student.course:
                print(f"Student {student.enrollment_id} has no course assigned - skipping")
                skipped_count += 1
                continue
            
            # Find fee structure for the student's course
            fee_structure = FeeStructure.objects.filter(course=student.course).first()
            
            if not fee_structure:
                print(f"No fee structure found for course {student.course.title} - skipping student {student.enrollment_id}")
                skipped_count += 1
                continue
            
            # Create StudentFee record
            student_fee = StudentFee.objects.create(
                student=student,
                fee_structure=fee_structure,
                total_amount=fee_structure.total_amount,
                amount_paid=0,
                status='unpaid'
            )
            
            print(f"Assigned fee structure '{fee_structure.name}' to student {student.enrollment_id}")
            assigned_count += 1
            
        except Exception as e:
            print(f"Error processing student {student.enrollment_id}: {str(e)}")
            error_count += 1
    
    print(f"\nFee structure assignment completed:")
    print(f"- Assigned: {assigned_count}")
    print(f"- Skipped: {skipped_count}")
    print(f"- Errors: {error_count}")

if __name__ == "__main__":
    assign_fee_structures()