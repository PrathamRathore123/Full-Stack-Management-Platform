#!/usr/bin/env python
"""
Script to add payment records for students with previous dates.
This will simulate that 90% of students have paid 1-2 installments with only 1-2 remaining.
"""

import os
import sys
import django
from datetime import date, timedelta
import random
import uuid

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import Student, StudentFee, FeePayment, FeeInstallment

def add_student_payments():
    """Add payment records for students with previous dates"""
    
    print("Adding payment records for students...")
    
    # Get all students with fee records
    student_fees = StudentFee.objects.all()
    print(f"Found {student_fees.count()} student fee records")
    
    # Calculate 90% of students
    total_students = student_fees.count()
    students_to_process = int(total_students * 0.9)
    
    print(f"Processing payments for {students_to_process} students (90%)")
    
    processed_count = 0
    payment_count = 0
    
    # Shuffle the queryset to get random 90%
    student_fee_list = list(student_fees)
    random.shuffle(student_fee_list)
    
    for student_fee in student_fee_list[:students_to_process]:
        try:
            # Skip if student already has payments
            if FeePayment.objects.filter(student_fee=student_fee).exists():
                print(f"Student {student_fee.student.enrollment_id} already has payments - skipping")
                continue
            
            # Get installments for this fee structure
            installments = FeeInstallment.objects.filter(
                fee_structure=student_fee.fee_structure
            ).order_by('sequence')
            
            if not installments.exists():
                print(f"No installments found for {student_fee.student.enrollment_id} - skipping")
                continue
            
            total_installments = installments.count()
            
            # Randomly decide how many installments to pay (1 or 2, leaving 1-2 remaining)
            if total_installments >= 3:
                installments_to_pay = random.choice([1, 2])  # Pay 1 or 2 installments
            elif total_installments == 2:
                installments_to_pay = 1  # Pay 1, leave 1 remaining
            else:
                installments_to_pay = 0  # Skip if only 1 installment total
            
            if installments_to_pay == 0:
                continue
            
            total_paid = 0
            
            # Create payment records for the selected installments
            for i in range(installments_to_pay):
                installment = installments[i]
                
                # Generate a random payment date in the past (1-6 months ago)
                days_ago = random.randint(30, 180)
                payment_date = date.today() - timedelta(days=days_ago)
                
                # Choose random payment mode
                payment_modes = ['cash', 'bank_transfer', 'online']
                payment_mode = random.choice(payment_modes)
                
                # Generate transaction ID for online payments
                transaction_id = f"TXN-{uuid.uuid4().hex[:8].upper()}" if payment_mode == 'online' else ""
                
                # Create payment record
                payment = FeePayment.objects.create(
                    student_fee=student_fee,
                    amount=installment.amount,
                    payment_date=payment_date,
                    payment_mode=payment_mode,
                    transaction_id=transaction_id,
                    receipt_number=f"REC-{uuid.uuid4().hex[:8].upper()}",
                    status='success',
                    remarks=f'Installment {installment.sequence} payment'
                )
                
                total_paid += float(installment.amount)
                payment_count += 1
                
                print(f"Added payment for {student_fee.student.enrollment_id} - Installment {installment.sequence} - Rs.{installment.amount}")
            
            # Update student fee record
            student_fee.amount_paid = total_paid
            student_fee.save()  # This will automatically update the status
            
            processed_count += 1
            
        except Exception as e:
            print(f"Error processing student {student_fee.student.enrollment_id}: {str(e)}")
    
    print(f"\nPayment addition completed:")
    print(f"- Students processed: {processed_count}")
    print(f"- Total payments added: {payment_count}")
    print(f"- Remaining students without payments: {total_students - processed_count}")

if __name__ == "__main__":
    add_student_payments()