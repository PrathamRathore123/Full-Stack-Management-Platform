#!/usr/bin/env python
"""
Script to add more payment records for students with previous dates.
This will ensure most students have paid multiple installments.
"""

import os
import sys
import django
from datetime import date, timedelta, datetime
import random
import uuid

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import Student, StudentFee, FeePayment, FeeInstallment
from django.utils import timezone

def add_more_payments():
    """Add more payment records for students"""
    
    print("Adding more payment records for students...")
    
    # Get all students with fee records
    student_fees = StudentFee.objects.all()
    print(f"Found {student_fees.count()} student fee records")
    
    payment_count = 0
    updated_students = 0
    
    for student_fee in student_fees:
        try:
            # Get installments for this fee structure
            installments = FeeInstallment.objects.filter(
                fee_structure=student_fee.fee_structure
            ).order_by('sequence')
            
            if not installments.exists():
                continue
            
            total_installments = installments.count()
            existing_payments = FeePayment.objects.filter(student_fee=student_fee).count()
            
            # Determine how many more installments to pay
            if total_installments <= 2:
                # For 2 installments, pay 1 (leaving 1 remaining)
                target_payments = 1
            elif total_installments == 3:
                # For 3 installments, pay 2 (leaving 1 remaining)
                target_payments = 2
            elif total_installments >= 4:
                # For 4+ installments, pay 2-3 (leaving 1-2 remaining)
                target_payments = random.choice([2, 3])
            
            # Skip if already has enough payments
            if existing_payments >= target_payments:
                continue
            
            payments_to_add = target_payments - existing_payments
            total_paid = float(student_fee.amount_paid)
            
            # Create additional payment records
            for i in range(payments_to_add):
                installment_index = existing_payments + i
                if installment_index >= total_installments:
                    break
                    
                installment = installments[installment_index]
                
                # Generate a random payment date in the past (1-8 months ago)
                days_ago = random.randint(30, 240)
                payment_date = timezone.now() - timedelta(days=days_ago)
                
                # Choose random payment mode
                payment_modes = ['cash', 'bank_transfer', 'online', 'online', 'online']  # More online payments
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
                    remarks=f'Installment {installment.sequence} payment via {payment_mode}'
                )
                
                total_paid += float(installment.amount)
                payment_count += 1
                
                print(f"Added payment for {student_fee.student.enrollment_id} - Installment {installment.sequence} - Rs.{installment.amount}")
            
            # Update student fee record
            if payments_to_add > 0:
                student_fee.amount_paid = total_paid
                student_fee.save()  # This will automatically update the status
                updated_students += 1
            
        except Exception as e:
            print(f"Error processing student {student_fee.student.enrollment_id}: {str(e)}")
    
    print(f"\nPayment addition completed:")
    print(f"- Students updated: {updated_students}")
    print(f"- Total payments added: {payment_count}")

if __name__ == "__main__":
    add_more_payments()