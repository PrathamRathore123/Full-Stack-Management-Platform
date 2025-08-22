from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, F
from django.conf import settings
from django.utils import timezone
import razorpay
import uuid

from .models import StudentFee, FeePayment, FeeStructure, FeeInstallment, Course, Enrollment
from .serializers import StudentFeeSerializer, FeePaymentSerializer

# Initialize Razorpay client
client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

class StudentFeeDetailsView(APIView):
    """
    API endpoint for students to view their own fee details.
    This endpoint is accessible only to authenticated students and returns only their own fee data.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Get the currently logged-in student
        student = request.user.student_profile
        
        try:
            # Get all enrollments for the student
            enrollments = Enrollment.objects.filter(student=student)
            
            # Get all fee records for the student
            student_fees = StudentFee.objects.filter(student=student)
            
            # Calculate total amounts
            total_amount = student_fees.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
            
            # Get all payments made by the student
            payments = FeePayment.objects.filter(student_fee__in=student_fees)
            amount_paid = payments.aggregate(Sum('amount'))['amount__sum'] or 0
            
            # Calculate due amount
            due_amount = total_amount - amount_paid
            
            # Determine status based on payment
            if amount_paid >= total_amount:
                status = 'paid'
            elif amount_paid > 0:
                status = 'partially_paid'
            else:
                status = 'unpaid'
            
            # Get course details with fee structures
            courses_data = []
            for enrollment in enrollments:
                course = enrollment.course
                fee_structure = FeeStructure.objects.filter(course=course).first()
                
                if fee_structure:
                    # Get installments for this fee structure
                    installments = FeeInstallment.objects.filter(fee_structure=fee_structure).order_by('due_date')
                    installments_data = []
                    
                    for installment in installments:
                        # Check if this installment has been paid
                        payment = FeePayment.objects.filter(
                            student_fee__in=student_fees,
                            installment=installment
                        ).first()
                        
                        installments_data.append({
                            'id': installment.id,
                            'amount': installment.amount,
                            'due_date': installment.due_date,
                            'sequence': installment.sequence,
                            'is_paid': payment is not None,
                            'payment_date': payment.payment_date if payment else None,
                            'payment_id': payment.id if payment else None
                        })
                    
                    courses_data.append({
                        'id': course.id,
                        'title': course.title,
                        'fee_structure': {
                            'id': fee_structure.id,
                            'name': fee_structure.name,
                            'registration_fee': fee_structure.registration_fee,
                            'tuition_fee': fee_structure.tuition_fee,
                            'total_amount': fee_structure.total_amount,
                            'installments': installments_data
                        }
                    })
            
            # Return the data
            return Response({
                'total_amount': total_amount,
                'amount_paid': amount_paid,
                'due_amount': due_amount,
                'status': status,
                'courses': courses_data,
                'recent_payments': FeePaymentSerializer(payments.order_by('-payment_date')[:5], many=True).data
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class InitializePaymentView(APIView):
    """
    API endpoint to initialize a payment for a fee installment.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        installment_id = request.data.get('installment_id')
        
        if not installment_id:
            return Response(
                {'error': 'Installment ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get the installment
            installment = FeeInstallment.objects.get(id=installment_id)
            
            # Get the student
            student = request.user.student_profile
            
            # Check if this installment has already been paid
            student_fee = StudentFee.objects.filter(
                student=student,
                fee_structure=installment.fee_structure
            ).first()
            
            if not student_fee:
                return Response(
                    {'error': 'No fee record found for this student and fee structure'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            payment_exists = FeePayment.objects.filter(
                student_fee=student_fee,
                installment=installment
            ).exists()
            
            if payment_exists:
                return Response(
                    {'error': 'This installment has already been paid'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create a Razorpay order
            receipt = f"fee_{student.id}_{installment.id}_{uuid.uuid4().hex[:8]}"
            amount_in_paise = int(installment.amount * 100)  # Convert to paise
            
            order_data = {
                'amount': amount_in_paise,
                'currency': 'INR',
                'receipt': receipt,
                'notes': {
                    'student_id': student.id,
                    'installment_id': installment.id,
                    'fee_structure_id': installment.fee_structure.id
                }
            }
            
            order = client.order.create(data=order_data)
            
            return Response({
                'order_id': order['id'],
                'amount': installment.amount,
                'currency': 'INR',
                'key_id': settings.RAZORPAY_KEY_ID,
                'student_name': f"{student.user.first_name} {student.user.last_name}",
                'student_email': student.user.email,
                'student_contact': student.phone_number
            })
            
        except FeeInstallment.DoesNotExist:
            return Response(
                {'error': 'Installment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class VerifyPaymentView(APIView):
    """
    API endpoint to verify a payment after it's completed.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        payment_id = request.data.get('razorpay_payment_id')
        order_id = request.data.get('razorpay_order_id')
        signature = request.data.get('razorpay_signature')
        installment_id = request.data.get('installment_id')
        
        if not all([payment_id, order_id, signature, installment_id]):
            return Response(
                {'error': 'Missing required payment information'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Verify the payment signature
            params_dict = {
                'razorpay_payment_id': payment_id,
                'razorpay_order_id': order_id,
                'razorpay_signature': signature
            }
            
            client.utility.verify_payment_signature(params_dict)
            
            # Get payment details from Razorpay
            payment = client.payment.fetch(payment_id)
            
            # Get the student
            student = request.user.student_profile
            
            # Get the installment
            installment = FeeInstallment.objects.get(id=installment_id)
            
            # Get or create the student fee record
            student_fee, created = StudentFee.objects.get_or_create(
                student=student,
                fee_structure=installment.fee_structure,
                defaults={
                    'total_amount': installment.fee_structure.total_amount,
                    'status': 'partially_paid'
                }
            )
            
            # Create a payment record
            fee_payment = FeePayment.objects.create(
                student_fee=student_fee,
                installment=installment,
                amount=installment.amount,
                payment_method='online',
                transaction_id=payment_id,
                payment_date=timezone.now(),
                status='completed'
            )
            
            # Update the student fee status
            total_paid = FeePayment.objects.filter(student_fee=student_fee).aggregate(Sum('amount'))['amount__sum'] or 0
            if total_paid >= student_fee.total_amount:
                student_fee.status = 'paid'
            else:
                student_fee.status = 'partially_paid'
            student_fee.save()
            
            return Response({
                'success': True,
                'payment_id': payment_id,
                'amount': installment.amount,
                'message': 'Payment successful'
            })
            
        except razorpay.errors.SignatureVerificationError:
            return Response(
                {'error': 'Invalid payment signature'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Add these to your urls.py file:
"""
from django.urls import path
from .views import StudentFeeDetailsView, InitializePaymentView, VerifyPaymentView

urlpatterns = [
    # ... other URL patterns
    path('student-fees/student-details/', StudentFeeDetailsView.as_view(), name='student-fee-details'),
    path('student-fees/initialize-payment/', InitializePaymentView.as_view(), name='initialize-payment'),
    path('student-fees/verify-payment/', VerifyPaymentView.as_view(), name='verify-payment'),
]
"""