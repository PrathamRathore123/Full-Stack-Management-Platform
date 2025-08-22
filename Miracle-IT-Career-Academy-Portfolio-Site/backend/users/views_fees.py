from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, viewsets
from rest_framework.decorators import action
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils import timezone
from django.db import models
from .models import (
    Student, FeeStructure, StudentFee, FeePayment, FeeInstallment
)

# Try to import AdminNotification, handle gracefully if it doesn't exist
try:
    from .models import AdminNotification
except ImportError:
    AdminNotification = None
from .serializers import (
    StudentFeeSerializer, FeePaymentSerializer, FeeInstallmentSerializer, 
    FeeStructureSerializer, AdminNotificationSerializer
)
from django.http import HttpResponse, FileResponse
import uuid
import io
try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

class IsFacultyUser:
    def has_permission(self, request, view):
        return True

# Debug endpoint to test authentication
class AuthTestView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({
            "user": str(request.user),
            "is_authenticated": request.user.is_authenticated,
            "has_student_profile": hasattr(request.user, 'student_profile')
        })

@api_view(['GET'])
@permission_classes([AllowAny])
def download_receipt_view(request, receipt_number=None):
    try:
        if not receipt_number:
            receipt_number = request.GET.get('receipt_number')
        if not receipt_number:
            return Response({"error": "Receipt number required"}, status=status.HTTP_400_BAD_REQUEST)
        
        payment = FeePayment.objects.filter(receipt_number=receipt_number).first()
        if not payment:
            return Response({"error": "Receipt not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if REPORTLAB_AVAILABLE:
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch)
            styles = getSampleStyleSheet()
            story = []
            
            # Custom styles
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                spaceAfter=30,
                alignment=TA_CENTER,
                textColor=colors.darkblue
            )
            
            header_style = ParagraphStyle(
                'CustomHeader',
                parent=styles['Heading2'],
                fontSize=16,
                spaceAfter=20,
                alignment=TA_CENTER,
                textColor=colors.darkgreen
            )
            
            # Header with institute logo placeholder
            story.append(Paragraph("🏫 ERP INSTITUTE", title_style))
            story.append(Paragraph("Fee Payment Receipt", header_style))
            story.append(Spacer(1, 20))
            
            # Receipt details table
            receipt_data = [
                ['Receipt Number:', payment.receipt_number],
                ['Date & Time:', payment.payment_date.strftime('%d/%m/%Y at %H:%M')],
                ['Student Name:', payment.student_fee.student.user.username],
                ['Enrollment ID:', payment.student_fee.student.enrollment_id],
                ['Course:', payment.student_fee.student.course.title if payment.student_fee.student.course else 'N/A'],
                ['Amount Paid:', f'₹{payment.amount:,.2f}'],
                ['Payment Mode:', payment.payment_mode.replace('_', ' ').title()],
                ['Transaction ID:', payment.transaction_id or 'N/A'],
                ['Status:', payment.status.title()],
            ]
            
            table = Table(receipt_data, colWidths=[2.5*inch, 3.5*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.lightblue),
                ('BACKGROUND', (1, 0), (1, -1), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 11),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('TOPPADDING', (0, 0), (-1, -1), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            
            story.append(table)
            story.append(Spacer(1, 30))
            
            # Payment method logos (placeholder)
            payment_logos = Paragraph(
                "💳 Accepted Payment Methods: Credit Card | Debit Card | UPI | Net Banking",
                ParagraphStyle('PaymentLogos', parent=styles['Normal'], alignment=TA_CENTER, fontSize=10)
            )
            story.append(payment_logos)
            story.append(Spacer(1, 20))
            
            # Footer
            footer_style = ParagraphStyle(
                'Footer',
                parent=styles['Normal'],
                fontSize=9,
                alignment=TA_CENTER,
                textColor=colors.grey
            )
            
            story.append(Paragraph("This is a computer generated receipt.", footer_style))
            story.append(Paragraph("For any queries, contact: admin@erpinstitute.com | +91-XXXXXXXXXX", footer_style))
            
            doc.build(story)
            buffer.seek(0)
            
            response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="receipt-{receipt_number}.pdf"'
            return response
        else:
            receipt_data = {
                'receipt_number': payment.receipt_number,
                'date': payment.payment_date.strftime('%d/%m/%Y'),
                'student_name': payment.student_fee.student.user.username,
                'amount': str(payment.amount),
                'payment_mode': payment.payment_mode,
                'status': payment.status
            }
            return Response(receipt_data)
            
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def student_fee_detail_view(request):
    try:
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            
        if not hasattr(user, 'student_profile'):
            return Response({"error": "Student profile not found"}, status=status.HTTP_403_FORBIDDEN)

        student = user.student_profile
        
        # Get or create student fee record
        student_fee = StudentFee.objects.filter(student=student).first()
        
        if not student_fee:
            # If no fee record exists, try to create one based on student's course
            if student.course:
                fee_structure = FeeStructure.objects.filter(course=student.course).first()
                if fee_structure:
                    student_fee = StudentFee.objects.create(
                        student=student,
                        fee_structure=fee_structure,
                        total_amount=fee_structure.total_amount,
                        amount_paid=0,
                        assigned_by=None
                    )
                else:
                    return Response({
                        "error": "No fee structure found for your course. Please contact admin."
                    }, status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({
                    "error": "No course assigned. Please contact admin."
                }, status=status.HTTP_404_NOT_FOUND)
        
        # Get installments
        installments = FeeInstallment.objects.filter(
            fee_structure=student_fee.fee_structure
        ).order_by('sequence')
        
        # Get payment history
        payments = FeePayment.objects.filter(
            student_fee=student_fee
        ).order_by('-payment_date')
        
        # Calculate next due date
        next_due_date = None
        if installments.exists():
            # Find the next unpaid installment
            total_paid = float(student_fee.amount_paid)
            cumulative_amount = 0
            for installment in installments:
                cumulative_amount += float(installment.amount)
                if total_paid < cumulative_amount:
                    next_due_date = installment.due_date
                    break
        
        # Prepare response data
        response_data = {
            'total_amount': float(student_fee.total_amount),
            'amount_paid': float(student_fee.amount_paid),
            'due_amount': float(student_fee.total_amount - student_fee.amount_paid),
            'next_due_date': next_due_date.isoformat() if next_due_date else None,
            'fee_details': {
                'id': student_fee.id,
                'fee_structure_name': student_fee.fee_structure.name,
                'status': student_fee.status,
                'assigned_date': student_fee.assigned_date.isoformat()
            },
            'installments': [{
                'id': inst.id,
                'amount': float(inst.amount),
                'due_date': inst.due_date.isoformat(),
                'sequence': inst.sequence
            } for inst in installments],
            'payment_history': [{
                'id': payment.id,
                'amount': float(payment.amount),
                'payment_date': payment.payment_date.isoformat(),
                'payment_mode': payment.payment_mode,
                'receipt_number': payment.receipt_number,
                'status': payment.status
            } for payment in payments]
        }
        
        return Response(response_data)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class StudentFeeDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            "message": "Class-based view working",
            "user_authenticated": request.user.is_authenticated if hasattr(request, 'user') else False
        })

class FacultyStudentFeeView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            batch_id = request.GET.get('batch_id')
            
            # Get students based on batch filter
            if batch_id:
                students = Student.objects.filter(batch_id=batch_id)
            else:
                students = Student.objects.all()
            
            student_fee_data = []
            
            for student in students:
                # Get student fee record
                student_fee = StudentFee.objects.filter(student=student).first()
                
                if student_fee:
                    # Determine payment status
                    if student_fee.amount_paid >= student_fee.total_amount:
                        status = 'paid'
                    elif student_fee.amount_paid > 0:
                        status = 'partially_paid'
                    else:
                        status = 'unpaid'
                    
                    # Get last payment date
                    last_payment = FeePayment.objects.filter(
                        student_fee=student_fee
                    ).order_by('-payment_date').first()
                    
                    student_fee_data.append({
                        'student_id': student.id,
                        'student_name': student.user.username,
                        'enrollment_id': student.enrollment_id,
                        'total_amount': float(student_fee.total_amount),
                        'amount_paid': float(student_fee.amount_paid),
                        'status': status,
                        'last_payment_date': last_payment.payment_date.isoformat() if last_payment else None
                    })
                else:
                    # Student has no fee record
                    student_fee_data.append({
                        'student_id': student.id,
                        'student_name': student.user.username,
                        'enrollment_id': student.enrollment_id,
                        'total_amount': 0,
                        'amount_paid': 0,
                        'status': 'unpaid',
                        'last_payment_date': None
                    })
            
            return Response(student_fee_data)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminFeeReportView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            # Get real fee statistics
            total_students = Student.objects.count()
            total_fees_collected = FeePayment.objects.filter(status='success').aggregate(
                total=models.Sum('amount')
            )['total'] or 0
            
            pending_fees = StudentFee.objects.filter(status__in=['unpaid', 'partially_paid']).aggregate(
                total=models.Sum(models.F('total_amount') - models.F('amount_paid'))
            )['total'] or 0
            
            recent_payments = FeePayment.objects.filter(
                status='success'
            ).order_by('-payment_date')[:10]
            
            return Response({
                'total_students': total_students,
                'total_fees_collected': float(total_fees_collected),
                'pending_fees': float(pending_fees),
                'recent_payments': [{
                    'student_name': payment.student_fee.student.user.username,
                    'amount': float(payment.amount),
                    'date': payment.payment_date.isoformat(),
                    'receipt_number': payment.receipt_number
                } for payment in recent_payments]
            })
            
        except Exception as e:
            return Response({
                'total_students': 0,
                'total_fees_collected': 0,
                'pending_fees': 0,
                'recent_payments': []
            })

class AdminNotificationViewSet(viewsets.ModelViewSet):
    serializer_class = AdminNotificationSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        try:
            return AdminNotification.objects.all()
        except:
            # If table doesn't exist yet, return empty list
            return []
    
    def list(self, request):
        try:
            notifications = AdminNotification.objects.all()
            serializer = self.get_serializer(notifications, many=True)
            return Response(serializer.data)
        except Exception as e:
            # Return empty list if table doesn't exist
            return Response([])
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        try:
            unread_notifications = AdminNotification.objects.filter(is_read=False)
            serializer = self.get_serializer(unread_notifications, many=True)
            return Response(serializer.data)
        except:
            return Response([])
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        try:
            notification = self.get_object()
            notification.is_read = True
            notification.save()
            return Response({'status': 'marked as read'})
        except:
            return Response({'status': 'error'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        try:
            AdminNotification.objects.filter(is_read=False).update(is_read=True)
            return Response({'status': 'all notifications marked as read'})
        except:
            return Response({'status': 'error'})

class FeeStructureViewSet(viewsets.ModelViewSet):
    queryset = FeeStructure.objects.all()
    serializer_class = FeeStructureSerializer
    permission_classes = [AllowAny]

class StudentFeeViewSet(viewsets.ModelViewSet):
    queryset = StudentFee.objects.all()
    serializer_class = StudentFeeSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'], url_path='details')
    def details(self, request):
        try:
            user = request.user
            if not user.is_authenticated:
                return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
                
            if not hasattr(user, 'student_profile'):
                return Response({"error": "Student profile not found"}, status=status.HTTP_403_FORBIDDEN)

            student = user.student_profile
            
            # Get or create student fee record
            student_fee = StudentFee.objects.filter(student=student).first()
            
            if not student_fee:
                # If no fee record exists, try to create one based on student's course
                if student.course:
                    fee_structure = FeeStructure.objects.filter(course=student.course).first()
                    if fee_structure:
                        student_fee = StudentFee.objects.create(
                            student=student,
                            fee_structure=fee_structure,
                            total_amount=fee_structure.total_amount,
                            amount_paid=0,
                            assigned_by=None
                        )
                    else:
                        return Response({
                            "error": "No fee structure found for your course. Please contact admin."
                        }, status=status.HTTP_404_NOT_FOUND)
                else:
                    return Response({
                        "error": "No course assigned. Please contact admin."
                    }, status=status.HTTP_404_NOT_FOUND)
            
            # Get installments
            installments = FeeInstallment.objects.filter(
                fee_structure=student_fee.fee_structure
            ).order_by('sequence')
            
            # Get payment history
            payments = FeePayment.objects.filter(
                student_fee=student_fee
            ).order_by('-payment_date')
            
            # Calculate next due date
            next_due_date = None
            if installments.exists():
                # Find the next unpaid installment
                total_paid = float(student_fee.amount_paid)
                cumulative_amount = 0
                for installment in installments:
                    cumulative_amount += float(installment.amount)
                    if total_paid < cumulative_amount:
                        next_due_date = installment.due_date
                        break
            
            # Return data in the exact format expected by frontend
            return Response({
                'total_amount': float(student_fee.total_amount),
                'amount_paid': float(student_fee.amount_paid),
                'due_amount': float(student_fee.total_amount - student_fee.amount_paid),
                'next_due_date': next_due_date.isoformat() if next_due_date else None,
                'fee_details': {
                    'id': student_fee.id,
                    'fee_structure_name': student_fee.fee_structure.name,
                    'status': student_fee.status,
                    'assigned_date': student_fee.assigned_date.isoformat()
                },
                'installments': [{
                    'id': inst.id,
                    'amount': float(inst.amount),
                    'due_date': inst.due_date.isoformat(),
                    'sequence': inst.sequence
                } for inst in installments],
                'payment_history': [{
                    'id': payment.id,
                    'amount': float(payment.amount),
                    'payment_date': payment.payment_date.isoformat(),
                    'payment_mode': payment.payment_mode,
                    'receipt_number': payment.receipt_number,
                    'status': payment.status
                } for payment in payments]
            })

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FeePaymentViewSet(viewsets.ModelViewSet):
    queryset = FeePayment.objects.all()
    serializer_class = FeePaymentSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'], url_path='make-payment')
    def make_payment(self, request):
        try:
            user = request.user
            if not user.is_authenticated:
                return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
                
            if not hasattr(user, 'student_profile'):
                return Response({"error": "Student profile not found"}, status=status.HTTP_403_FORBIDDEN)

            student = user.student_profile
            student_fee = StudentFee.objects.filter(student=student).first()
            
            if not student_fee:
                return Response({"error": "No fee record found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Create payment record
            payment_data = {
                'student_fee': student_fee.id,
                'amount': request.data.get('amount'),
                'payment_mode': request.data.get('payment_mode', 'online'),
                'transaction_id': request.data.get('transaction_id', ''),
                'status': request.data.get('status', 'success'),
                'remarks': request.data.get('remarks', ''),
                'receipt_number': f"REC-{uuid.uuid4().hex[:8].upper()}"
            }
            
            serializer = self.get_serializer(data=payment_data)
            if serializer.is_valid():
                payment = serializer.save(recorded_by=user)
                return Response({
                    'message': 'Payment recorded successfully',
                    'payment': serializer.data
                })
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'], url_path='download-receipt')
    def download_receipt(self, request):
        try:
            receipt_number = request.GET.get('receipt_number')
            if not receipt_number:
                return Response({"error": "Receipt number required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get payment record
            payment = FeePayment.objects.filter(receipt_number=receipt_number).first()
            if not payment:
                return Response({"error": "Receipt not found"}, status=status.HTTP_404_NOT_FOUND)
            
            if REPORTLAB_AVAILABLE:
                # Generate PDF receipt with enhanced design
                buffer = io.BytesIO()
                doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch)
                styles = getSampleStyleSheet()
                story = []
                
                # Custom styles
                title_style = ParagraphStyle(
                    'CustomTitle',
                    parent=styles['Heading1'],
                    fontSize=24,
                    spaceAfter=30,
                    alignment=TA_CENTER,
                    textColor=colors.darkblue
                )
                
                header_style = ParagraphStyle(
                    'CustomHeader',
                    parent=styles['Heading2'],
                    fontSize=16,
                    spaceAfter=20,
                    alignment=TA_CENTER,
                    textColor=colors.darkgreen
                )
                
                # Header with institute logo placeholder
                story.append(Paragraph("🏫 ERP INSTITUTE", title_style))
                story.append(Paragraph("Fee Payment Receipt", header_style))
                story.append(Spacer(1, 20))
                
                # Receipt details table
                receipt_data = [
                    ['Receipt Number:', payment.receipt_number],
                    ['Date & Time:', payment.payment_date.strftime('%d/%m/%Y at %H:%M')],
                    ['Student Name:', payment.student_fee.student.user.username],
                    ['Enrollment ID:', payment.student_fee.student.enrollment_id],
                    ['Course:', payment.student_fee.student.course.title if payment.student_fee.student.course else 'N/A'],
                    ['Amount Paid:', f'₹{payment.amount:,.2f}'],
                    ['Payment Mode:', payment.payment_mode.replace('_', ' ').title()],
                    ['Transaction ID:', payment.transaction_id or 'N/A'],
                    ['Status:', payment.status.title()],
                ]
                
                table = Table(receipt_data, colWidths=[2.5*inch, 3.5*inch])
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (0, -1), colors.lightblue),
                    ('BACKGROUND', (1, 0), (1, -1), colors.lightgrey),
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 11),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                    ('TOPPADDING', (0, 0), (-1, -1), 12),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ]))
                
                story.append(table)
                story.append(Spacer(1, 30))
                
                # Payment method logos (placeholder)
                payment_logos = Paragraph(
                    "💳 Accepted Payment Methods: Credit Card | Debit Card | UPI | Net Banking",
                    ParagraphStyle('PaymentLogos', parent=styles['Normal'], alignment=TA_CENTER, fontSize=10)
                )
                story.append(payment_logos)
                story.append(Spacer(1, 20))
                
                # Footer
                footer_style = ParagraphStyle(
                    'Footer',
                    parent=styles['Normal'],
                    fontSize=9,
                    alignment=TA_CENTER,
                    textColor=colors.grey
                )
                
                story.append(Paragraph("This is a computer generated receipt.", footer_style))
                story.append(Paragraph("For any queries, contact: admin@erpinstitute.com | +91-XXXXXXXXXX", footer_style))
                
                doc.build(story)
                buffer.seek(0)
                
                response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
                response['Content-Disposition'] = f'attachment; filename="receipt-{receipt_number}.pdf"'
                return response
            else:
                # Fallback: return JSON with receipt data
                receipt_data = {
                    'receipt_number': payment.receipt_number,
                    'date': payment.payment_date.strftime('%d/%m/%Y'),
                    'student_name': payment.student_fee.student.user.username,
                    'enrollment_id': payment.student_fee.student.enrollment_id,
                    'course': payment.student_fee.student.course.title if payment.student_fee.student.course else 'N/A',
                    'amount': str(payment.amount),
                    'payment_mode': payment.payment_mode,
                    'transaction_id': payment.transaction_id or 'N/A',
                    'status': payment.status
                }
                return Response(receipt_data)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'], url_path='create-razorpay-order')
    def create_razorpay_order(self, request):
        try:
            from django.conf import settings
            
            user = request.user
            if not user.is_authenticated:
                return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
                
            if not hasattr(user, 'student_profile'):
                return Response({"error": "Student profile not found"}, status=status.HTTP_403_FORBIDDEN)

            student = user.student_profile
            student_fee = StudentFee.objects.filter(student=student).first()
            
            if not student_fee:
                return Response({"error": "No fee record found"}, status=status.HTTP_404_NOT_FOUND)
            
            amount = float(request.data.get('amount', 0))
            if amount <= 0 or amount > student_fee.total_amount - student_fee.amount_paid:
                return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                import razorpay
                
                # Initialize Razorpay client with actual credentials
                client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
                
                # Create Razorpay order
                order_data = {
                    'amount': int(amount * 100),  # Amount in paise
                    'currency': 'INR',
                    'receipt': f'receipt_{uuid.uuid4().hex[:10]}',
                    'notes': {
                        'student_id': student.id,
                        'student_name': student.user.username,
                        'fee_type': 'course_fee'
                    }
                }
                
                razorpay_order = client.order.create(data=order_data)
                
                # Return order details to frontend
                response_data = {
                    'order_id': razorpay_order['id'],
                    'amount': razorpay_order['amount'],
                    'currency': razorpay_order['currency'],
                    'key_id': settings.RAZORPAY_KEY_ID,
                    'student_name': student.user.username,
                    'student_email': student.user.email or 'student@example.com',
                    'student_contact': '9999999999'  # You should store actual contact in student model
                }
                
                return Response(response_data)
                
            except ImportError:
                # Razorpay not installed, return demo data
                response_data = {
                    'order_id': f'order_{uuid.uuid4().hex[:10]}',
                    'amount': int(amount * 100),
                    'currency': 'INR',
                    'key_id': 'demo_key_only',
                    'student_name': student.user.username,
                    'student_email': student.user.email or 'student@example.com',
                    'student_contact': '9999999999',
                    'demo_mode': True
                }
                
                return Response(response_data)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'], url_path='demo-payment')
    def demo_payment(self, request):
        """Demo payment endpoint for testing without Razorpay"""
        try:
            user = request.user
            if not user.is_authenticated:
                return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
                
            if not hasattr(user, 'student_profile'):
                return Response({"error": "Student profile not found"}, status=status.HTTP_403_FORBIDDEN)

            student = user.student_profile
            student_fee = StudentFee.objects.filter(student=student).first()
            
            if not student_fee:
                return Response({"error": "No fee record found"}, status=status.HTTP_404_NOT_FOUND)
            
            amount = float(request.data.get('amount', 100))
            
            # Create demo payment record
            payment = FeePayment.objects.create(
                student_fee=student_fee,
                amount=amount,
                payment_mode='online',
                transaction_id=f'DEMO_{uuid.uuid4().hex[:8].upper()}',
                receipt_number=f"REC-{uuid.uuid4().hex[:8].upper()}",
                status='success',
                remarks='Demo payment for testing',
                recorded_by=user
            )
            
            return Response({
                'message': 'Demo payment successful',
                'receipt_number': payment.receipt_number,
                'payment_id': payment.id,
                'amount': float(payment.amount)
            })
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'], url_path='verify-razorpay-payment')
    def verify_razorpay_payment(self, request):
        try:
            from django.conf import settings
            import logging
            
            logger = logging.getLogger(__name__)
            logger.info(f"Payment verification request data: {request.data}")
            
            user = request.user
            if not user.is_authenticated:
                return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
                
            if not hasattr(user, 'student_profile'):
                return Response({"error": "Student profile not found"}, status=status.HTTP_403_FORBIDDEN)

            student = user.student_profile
            student_fee = StudentFee.objects.filter(student=student).first()
            
            if not student_fee:
                return Response({"error": "No fee record found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Get payment details from request
            razorpay_payment_id = request.data.get('razorpay_payment_id')
            razorpay_order_id = request.data.get('razorpay_order_id')
            razorpay_signature = request.data.get('razorpay_signature')
            amount_data = request.data.get('amount', 0)
            
            logger.info(f"Payment details - ID: {razorpay_payment_id}, Order: {razorpay_order_id}, Amount: {amount_data}")
            
            # Handle amount conversion properly
            try:
                if isinstance(amount_data, str) and amount_data.startswith('demo_'):
                    # Demo payment, use a default amount
                    amount = 100.0  # Default demo amount
                else:
                    amount = float(amount_data) / 100  # Convert from paise to rupees
            except (ValueError, TypeError) as e:
                logger.error(f"Amount conversion error: {e}")
                amount = 100.0  # Fallback amount
            
            if not all([razorpay_payment_id, razorpay_order_id]):
                return Response({"error": "Missing payment details"}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                import razorpay
                
                # Initialize Razorpay client
                client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
                
                # Verify payment signature if provided and not demo
                if razorpay_signature and razorpay_signature != 'demo_signature':
                    try:
                        client.utility.verify_payment_signature({
                            'razorpay_order_id': razorpay_order_id,
                            'razorpay_payment_id': razorpay_payment_id,
                            'razorpay_signature': razorpay_signature
                        })
                        logger.info("Payment signature verified successfully")
                    except razorpay.errors.SignatureVerificationError as e:
                        logger.error(f"Signature verification failed: {e}")
                        return Response({"error": "Payment signature verification failed"}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    logger.info("Skipping signature verification (demo mode)")
                
            except ImportError:
                # Razorpay not installed, skip verification for demo mode
                logger.info("Razorpay not available, using demo mode")
                pass
            
            # Create payment record
            try:
                payment = FeePayment.objects.create(
                    student_fee=student_fee,
                    amount=amount,
                    payment_mode='online',
                    transaction_id=razorpay_payment_id,
                    receipt_number=f"REC-{uuid.uuid4().hex[:8].upper()}",
                    status='success',
                    remarks=f'Online payment via Razorpay - Order: {razorpay_order_id}',
                    recorded_by=user
                )
                
                logger.info(f"Payment record created successfully: {payment.receipt_number}")
                
                return Response({
                    'message': 'Payment verified and recorded successfully',
                    'receipt_number': payment.receipt_number,
                    'payment_id': payment.id
                })
                
            except Exception as db_error:
                logger.error(f"Database error creating payment: {db_error}")
                return Response({"error": f"Failed to record payment: {str(db_error)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Exception as e:
            import traceback
            logger = logging.getLogger(__name__)
            logger.error(f"Payment verification error: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response({"error": f"Payment verification failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)