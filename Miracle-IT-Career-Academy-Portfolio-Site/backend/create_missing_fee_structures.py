#!/usr/bin/env python
"""
Script to create fee structures for courses that don't have them.
"""

import os
import sys
import django
from datetime import date, timedelta

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import FeeStructure, FeeInstallment, Student, StudentFee
from courses.models import Course

def create_missing_fee_structures():
    """Create fee structures for courses that don't have them"""
    
    print("Creating missing fee structures...")
    
    # Get courses without fee structures
    courses_without_fees = Course.objects.filter(
        fee_structures__isnull=True
    ).distinct()
    
    print(f"Found {courses_without_fees.count()} courses without fee structures")
    
    # Default fee structure data for different course types
    fee_data = {
        'Full Stack Web Development': {'total': 75000, 'registration': 5000, 'tuition': 70000, 'installments': 3},
        'PGDSE': {'total': 85000, 'registration': 10000, 'tuition': 75000, 'installments': 4},
        'Cyber Security': {'total': 80000, 'registration': 8000, 'tuition': 72000, 'installments': 3},
        'Data Science': {'total': 90000, 'registration': 10000, 'tuition': 80000, 'installments': 4},
        'C/ C++/ Data Structure': {'total': 45000, 'registration': 5000, 'tuition': 40000, 'installments': 2},
        'Cloud Computing': {'total': 70000, 'registration': 7000, 'tuition': 63000, 'installments': 3},
        'Devops': {'total': 65000, 'registration': 5000, 'tuition': 60000, 'installments': 3},
        'Java': {'total': 55000, 'registration': 5000, 'tuition': 50000, 'installments': 2},
        'BigData': {'total': 85000, 'registration': 10000, 'tuition': 75000, 'installments': 4},
        'Python Programming': {'total': 50000, 'registration': 5000, 'tuition': 45000, 'installments': 2},
    }
    
    created_count = 0
    
    for course in courses_without_fees:
        try:
            # Get fee data for this course or use default
            course_fee_data = fee_data.get(course.title, {
                'total': 60000, 
                'registration': 6000, 
                'tuition': 54000, 
                'installments': 3
            })
            
            # Create fee structure
            fee_structure = FeeStructure.objects.create(
                name=f"{course.title} Fee Structure - 2025",
                course=course,
                registration_fee=course_fee_data['registration'],
                tuition_fee=course_fee_data['tuition'],
                total_amount=course_fee_data['total'],
                installments=course_fee_data['installments']
            )
            
            # Create installments
            installment_amount = course_fee_data['total'] / course_fee_data['installments']
            base_date = date.today()
            
            for i in range(course_fee_data['installments']):
                due_date = base_date + timedelta(days=30 * (i + 1))  # Monthly installments
                
                FeeInstallment.objects.create(
                    fee_structure=fee_structure,
                    amount=installment_amount,
                    due_date=due_date,
                    sequence=i + 1
                )
            
            print(f"Created fee structure for {course.title}")
            created_count += 1
            
            # Assign fee structure to existing students of this course
            students = Student.objects.filter(course=course)
            assigned_students = 0
            
            for student in students:
                # Check if student already has a fee structure
                if not StudentFee.objects.filter(student=student).exists():
                    StudentFee.objects.create(
                        student=student,
                        fee_structure=fee_structure,
                        total_amount=fee_structure.total_amount,
                        amount_paid=0,
                        status='unpaid'
                    )
                    assigned_students += 1
            
            print(f"  - Assigned to {assigned_students} students")
            
        except Exception as e:
            print(f"Error creating fee structure for {course.title}: {str(e)}")
    
    print(f"\nCreated {created_count} fee structures")

if __name__ == "__main__":
    create_missing_fee_structures()