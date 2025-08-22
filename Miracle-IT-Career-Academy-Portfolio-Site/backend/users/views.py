from rest_framework import generics, permissions, status, viewsets
from .views_projects import ProjectViewSet, ProjectSubmissionViewSet, StudentAchievementViewSet, current_user_view, project_technologies
from rest_framework.decorators import action, api_view, permission_classes
from django.db.models import Q
from .models import CustomUser, Student, Faculty, Admin, Workshop, Certificate, WorkshopRegistration, Batch, Attendance, Holiday
from datetime import datetime, date, timedelta
from .serializers import (
    RegisterSerializer, UserSerializer, CreateAdminSerializer, 
    CreateFacultySerializer, CreateStudentSerializer, StudentSerializer,
    FacultySerializer, AdminSerializer, StudentLoginSerializer,
    WorkshopSerializer, CertificateSerializer, IntegratedDashboardSerializer,
    WorkshopRegistrationSerializer, BatchSerializer
)
from courses.models import Course, CourseSyllabus, SyllabusItem, Video, Quiz, CourseEnrollment, Notification
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
import logging
from datetime import datetime, date

logger = logging.getLogger(__name__)

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsFaculty(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'faculty'

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username', '')
        logger.info(f"Login attempt for username: {username}")
        
        try:
            response = super().post(request, *args, **kwargs)
            if response.status_code == 200:
                logger.info(f"Login successful for username: {username}")
                # Add role information to the response data
                user = authenticate(username=username, password=request.data.get('password', ''))
                if user is not None:
                    response.data['role'] = user.role
                    
                    # Mark attendance if user is a student
                    if user.role == 'student':
                        try:
                            student = Student.objects.get(user=user)
                            today = date.today()
                            # Check if attendance already exists for today
                            attendance, created = Attendance.objects.get_or_create(
                                student=student,
                                date=today,
                                defaults={'is_present': True}
                            )
                            if created:
                                logger.info(f"Attendance marked for student {username} on {today}")
                            else:
                                logger.info(f"Attendance already exists for student {username} on {today}")
                        except Exception as e:
                            logger.error(f"Error marking attendance: {str(e)}")
            else:
                logger.warning(f"Login failed for username: {username}, response: {response.data}")
            return response
        except Exception as e:
            logger.error(f"Login exception for username: {username}, error: {str(e)}")
            return Response(
                {"detail": "Invalid credentials. Please check your username and password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

class StudentLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        logger.debug(f"StudentLoginView - Request data: {request.data}")
        
        serializer = StudentLoginSerializer(data=request.data)
        if serializer.is_valid():
            enrollment_id = serializer.validated_data['enrollment_id']
            password = serializer.validated_data['date_of_birth']
            
            logger.debug(f"Looking for student with enrollment_id={enrollment_id}, password={password}")
            
            try:
                # Find student with this enrollment ID
                students = Student.objects.filter(enrollment_id=enrollment_id.strip())
    
                if not students.exists():
                     return Response({"detail": "Invalid enrollment ID."}, status=status.HTTP_401_UNAUTHORIZED)
    
                # Get the student
                student = students.first()
                user = student.user
    
                # Try direct authentication first
                auth_user = authenticate(username=user.username, password=password)
    
                if auth_user:
                    # Direct authentication succeeded
                    refresh = RefreshToken.for_user(auth_user)
                    
                    # Mark attendance for today
                    today = date.today()
                    attendance, created = Attendance.objects.get_or_create(
                        student=student,
                        date=today,
                        defaults={'is_present': True}
                    )
                    if created:
                        logger.info(f"Attendance marked for student {user.username} on {today}")
                    else:
                        logger.info(f"Attendance already exists for student {user.username} on {today}")
                    
                    return Response({
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                        'user': UserSerializer(auth_user).data
                    })
                else:
                    # Update the user's password to match their current DOB
                    dob_password = student.date_of_birth.strftime('%d%m%Y')
                    user.set_password(dob_password)
                    user.save()
        
                    # Try authentication with the new password
                    auth_user = authenticate(username=user.username, password=dob_password)
        
                    if auth_user:
                        refresh = RefreshToken.for_user(auth_user)
                        
                        # Mark attendance for today
                        today = date.today()
                        attendance, created = Attendance.objects.get_or_create(
                            student=student,
                            date=today,
                            defaults={'is_present': True}
                        )
                        if created:
                            logger.info(f"Attendance marked for student {user.username} on {today}")
                        else:
                            logger.info(f"Attendance already exists for student {user.username} on {today}")
                        
                        return Response({
                            'refresh': str(refresh),
                            'access': str(refresh.access_token),
                            'user': UserSerializer(auth_user).data
                        })
                    else:
                        return Response({"detail": "Login failed. Please contact support."}, 
                                            status=status.HTTP_401_UNAUTHORIZED)
            except Exception as e:
                    logger.error(f"Exception during student login: {str(e)}")
                    return Response({"detail": f"An error occurred: {str(e)}"}, 
                                    status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class ProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            data = UserSerializer(user).data
            
            if user.role == 'student':
                student_data = StudentSerializer(user.student_profile).data
                data.update({'student_profile': student_data})
            elif user.role == 'faculty':
                faculty_data = FacultySerializer(user.faculty_profile).data
                data.update({'faculty_profile': faculty_data})
            elif user.role == 'admin':
                admin_data = AdminSerializer(user.admin_profile).data
                data.update({'admin_profile': admin_data})
                
            return Response(data)
        except Exception as e:
            logger.error(f"Profile view error: {str(e)}")
            return Response(
                {"detail": "Error retrieving profile data."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CreateAdminView(APIView):
    permission_classes = [permissions.AllowAny]  # Initially allow anyone to create the first admin
    
    def post(self, request):
        # Check if any admin exists
        if Admin.objects.exists():
            return Response(
                {"detail": "Admin already exists. Only one admin can be created."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = CreateAdminSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"detail": "Admin created successfully."},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CreateFacultyView(APIView):
    # Temporarily allow any authenticated user for debugging
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        logger.debug(f"CreateFacultyView - User: {request.user}, Role: {request.user.role}")
        logger.debug(f"Request data: {request.data}")
        
        # For debugging, temporarily bypass role check
        # if request.user.role != 'admin':
        #     return Response(
        #         {"detail": "Only admin users can create faculty accounts."},
        #         status=status.HTTP_403_FORBIDDEN
        #     )
        
        serializer = CreateFacultySerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                faculty = serializer.save()
                logger.debug(f"Faculty created successfully: {faculty}")
                return Response(
                    {"detail": "Faculty created successfully."},
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                logger.error(f"Error creating faculty: {str(e)}")
                return Response(
                    {"detail": f"Error creating faculty: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            logger.error(f"Faculty serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CreateStudentView(APIView):
    # Temporarily allow any user for testing
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        logger.debug(f"CreateStudentView - User: {request.user if request.user.is_authenticated else 'Anonymous'}, Role: {getattr(request.user, 'role', 'N/A')}")
        logger.debug(f"Request data: {request.data}")

        serializer = CreateStudentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                student = serializer.save()
                logger.debug(f"Student created successfully: {student}")
                logger.debug(f"Student details - enrollment_id: {student.enrollment_id}, date_of_birth: {student.date_of_birth}")
                logger.debug(f"Password set as: {student.date_of_birth.strftime('%d%m%Y')}")
                return Response(
                    {"detail": "Student created successfully."},
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                logger.error(f"Error creating student: {str(e)}")
                return Response(
                    {"detail": f"Error creating student: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            logger.error(f"Student serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Batch.objects.all()
        course_id = self.request.query_params.get('course', None)
        if course_id is not None:
            queryset = queryset.filter(course_id=course_id)
        return queryset
        
    def create(self, request, *args, **kwargs):
        try:
            # Extract data from request
            name = request.data.get('name')
            course_id = request.data.get('course_id')
            
            # Create batch directly using raw SQL
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO users_batch (name, course_id, created_at, updated_at) VALUES (%s, %s, NOW(), NOW())",
                    [name, course_id]
                )
                batch_id = cursor.lastrowid
                
            # Get the created batch
            batch = Batch.objects.get(id=batch_id)
            
            # Return serialized data
            serializer = self.get_serializer(batch)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            import traceback
            logger.error(f"Error in BatchViewSet.create: {str(e)}")
            logger.error(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        try:
            # Log the incoming data for debugging
            logger.info(f"Creating batch with data: {self.request.data}")
            
            # Save the batch
            batch = serializer.save()
            logger.info(f"Batch created successfully: {serializer.data}")
            return batch
        except Exception as e:
            logger.error(f"Error creating batch: {str(e)}")
            # Return a more specific error response
            from rest_framework.exceptions import APIException
            raise APIException(f"Failed to create batch: {str(e)}")

    @action(detail=True, methods=['post'])
    def assign_students(self, request, pk=None):
        batch = self.get_object()
        student_ids = request.data.get('student_ids', [])
        if not isinstance(student_ids, list):
            return Response({"error": "student_ids must be a list"}, status=status.HTTP_400_BAD_REQUEST)
        students = Student.objects.filter(id__in=student_ids)
        for student in students:
            student.batch = batch
            student.save()
        return Response({"message": f"Assigned {students.count()} students to batch {batch.name}"}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def get_students(self, request, pk=None):
        """Get all students in a specific batch"""
        try:
            batch = self.get_object()
            students = Student.objects.filter(batch=batch)
            serializer = StudentSerializer(students, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error fetching students for batch {pk}: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ListFacultyView(generics.ListAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]  # Temporarily allow any authenticated user
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer

class ListStudentView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Get batch_id from query parameters
            batch_id = request.query_params.get('batch_id', None)
            
            # Filter students by batch_id if provided
            if batch_id:
                # Convert batch_id to integer for proper filtering
                try:
                    batch_id = int(batch_id)
                    # Use direct SQL query to ensure proper filtering
                    from django.db import connection
                    with connection.cursor() as cursor:
                        cursor.execute(
                            "SELECT * FROM users_student WHERE batch_id = %s",
                            [batch_id]
                        )
                        columns = [col[0] for col in cursor.description]
                        student_data = [dict(zip(columns, row)) for row in cursor.fetchall()]
                    
                    # Get the student objects based on the IDs from the SQL query
                    student_ids = [student['id'] for student in student_data]
                    students = Student.objects.filter(id__in=student_ids)
                    logger.info(f"Filtered students by batch_id={batch_id}, found {students.count()} students")
                except ValueError:
                    logger.error(f"Invalid batch_id format: {batch_id}")
                    students = Student.objects.none()
            else:
                students = Student.objects.all()
                
            serializer = StudentSerializer(students, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in ListStudentView.get: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return Response(
                {"detail": f"An error occurred while fetching students: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# New ViewSets for Workshop and Certificate
class WorkshopViewSet(viewsets.ModelViewSet):
    queryset = Workshop.objects.all()
    serializer_class = WorkshopSerializer
    permission_classes = [permissions.AllowAny]  # Allow public access for GET

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # Log the serializer errors for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Workshop creation failed: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WorkshopRegistrationViewSet(viewsets.ModelViewSet):
    queryset = WorkshopRegistration.objects.all()
    serializer_class = WorkshopRegistrationSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def list(self, request, *args, **kwargs):
        # Only admin and faculty can list all registrations
        if not request.user.is_authenticated or (request.user.role != 'admin' and request.user.role != 'faculty'):
            return Response(
                {"detail": "You do not have permission to view workshop registrations."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().list(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def past_attendees(self, request):
        """Get past workshop attendees"""
        if not request.user.is_authenticated or (request.user.role != 'admin' and request.user.role != 'faculty'):
            return Response(
                {"detail": "You do not have permission to view past workshop attendees."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from datetime import date
        past_workshops = Workshop.objects.filter(date__lt=date.today())
        past_registrations = WorkshopRegistration.objects.filter(workshop__in=past_workshops)
        serializer = self.get_serializer(past_registrations, many=True)
        return Response(serializer.data)

class CertificateViewSet(viewsets.ModelViewSet):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer

class IntegratedDashboardView(APIView):
    """
    Integrated API endpoint that provides all data needed for the frontend
    including user profile, courses, workshops, certificates, and notifications
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.AllowAny]  # Allow public access for GET
    
    def get(self, request):
        try:
            # For authenticated users, provide full dashboard
            if request.user.is_authenticated:
                user = request.user
                serializer = IntegratedDashboardSerializer(user)
                return Response(serializer.data)
            else:
                # For anonymous users, provide only public data
                # Create a minimal response with just public data
                courses = Course.objects.all()
                workshops = Workshop.objects.all()
                certificates = Certificate.objects.all()
                quizzes = Quiz.objects.all()
                
                from .serializers import CourseIntegratedSerializer, WorkshopSerializer, CertificateSerializer, QuizIntegratedSerializer
                
                return Response({
                    'courses': CourseIntegratedSerializer(courses, many=True).data,
                    'workshops': WorkshopSerializer(workshops, many=True).data,
                    'certificates': CertificateSerializer(certificates, many=True).data,
                    'quizzes': QuizIntegratedSerializer(quizzes, many=True).data
                })
        except Exception as e:
            logger.error(f"Integrated dashboard error: {str(e)}")
            return Response(
                {"detail": f"Error retrieving dashboard data: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    def post(self, request):
        """
        Handle various actions through a single endpoint
        """
        # Require authentication for POST actions
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required for this action"},
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        action = request.data.get('action')
        
        if action == 'enroll_course':
            return self._enroll_in_course(request)
        elif action == 'mark_notification_read':
            return self._mark_notification_read(request)
        else:
            return Response(
                {"detail": "Invalid action specified"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _enroll_in_course(self, request):
        course_id = request.data.get('course_id')
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
        
        enrollment, created = CourseEnrollment.objects.get_or_create(
            user=request.user,
            course=course
        )
        
        if created:
            return Response({'message': 'Successfully enrolled in course'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Already enrolled in this course'}, status=status.HTTP_200_OK)
    
    def _mark_notification_read(self, request):
        notification_id = request.data.get('notification_id')
        
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({'message': 'Notification marked as read'}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Student.objects.all()
        batch_id = self.request.query_params.get('batch_id', None)
        if batch_id:
            try:
                batch_id = int(batch_id)
                queryset = queryset.filter(batch_id=batch_id)
                logger.info(f"StudentViewSet: Filtered by batch_id={batch_id}, found {queryset.count()} students")
            except ValueError:
                logger.error(f"StudentViewSet: Invalid batch_id format: {batch_id}")
                queryset = Student.objects.none()
        return queryset
    
    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            
            # Update user fields
            user = instance.user
            if 'username' in request.data:
                new_username = request.data.get('username')
                # Check if username already exists for a different user
                if CustomUser.objects.filter(username=new_username).exclude(id=user.id).exists():
                    return Response(
                        {"detail": f"Username '{new_username}' is already taken."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                user.username = new_username
                
            if 'email' in request.data:
                user.email = request.data.get('email')
            user.save()
            
            # Update student fields
            if 'date_of_birth' in request.data:
                instance.date_of_birth = request.data.get('date_of_birth')
                
            if 'admission_date' in request.data:
                instance.admission_date = request.data.get('admission_date')
            
            # Handle batch_id if provided
            if 'batch_id' in request.data and request.data['batch_id']:
                try:
                    batch = Batch.objects.get(id=request.data['batch_id'])
                    instance.batch = batch
                except Batch.DoesNotExist:
                    pass
            
            # Handle course_id if provided
            if 'course_id' in request.data and request.data['course_id']:
                from courses.models import Course
                try:
                    course = Course.objects.get(id=request.data['course_id'])
                    instance.course = course
                except Course.DoesNotExist:
                    pass
            
            instance.save()
            return Response(StudentSerializer(instance).data)
        except Exception as e:
            import traceback
            logger.error(f"Error updating student: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {"detail": f"Error updating student: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
from .serializers import AttendanceSerializer

class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            # Students can only see their own attendance
            try:
                student = Student.objects.get(user=user)
                return Attendance.objects.filter(student=student).order_by('-date')
            except Student.DoesNotExist:
                return Attendance.objects.none()
        else:
            # Faculty and admin can see all attendance records
            # Filter by student_id if provided
            student_id = self.request.query_params.get('student_id', None)
            date_param = self.request.query_params.get('date', None)
            batch_id = self.request.query_params.get('batch_id', None)
            
            queryset = Attendance.objects.all()
            
            if student_id:
                queryset = queryset.filter(student_id=student_id)
            
            if date_param:
                queryset = queryset.filter(date=date_param)
                
            if batch_id:
                queryset = queryset.filter(student__batch_id=batch_id)
                
            return queryset.order_by('-date')
    
    @action(detail=False, methods=['get'])
    def my_attendance(self, request):
        """Get attendance for the logged-in student"""
        # Allow any authenticated user for testing
        # if request.user.role != 'student':
        #     return Response(
        #         {"detail": "Only students can access their attendance records."},
        #         status=status.HTTP_403_FORBIDDEN
        #     )
        
        try:
            student = Student.objects.get(user=request.user)
            admission_date = student.admission_date
            today = date.today()
            
            # Get all holidays
            holidays = Holiday.objects.filter(date__gte=admission_date, date__lte=today)
            holiday_dates = {h.date: h.name for h in holidays}
            
            # Calculate working days (excluding Sundays and holidays)
            working_days = []
            current_date = admission_date
            while current_date <= today:
                # Skip Sundays (weekday 6) and holidays
                if current_date.weekday() != 6 and current_date not in holiday_dates:
                    working_days.append(current_date)
                current_date += timedelta(days=1)
            
            # Get student's attendance records for working days only
            attendance = Attendance.objects.filter(
                student=student,
                date__gte=admission_date,
                date__lte=today
            ).order_by('-date')
            
            # If no attendance records, create one for today if it's a working day
            if not attendance.exists() and today.weekday() != 6 and today not in holiday_dates:
                Attendance.objects.create(
                    student=student,
                    date=today,
                    is_present=True
                )
                attendance = Attendance.objects.filter(student=student).order_by('-date')
            
            serializer = self.get_serializer(attendance, many=True)
            
            # Calculate attendance statistics
            total_working_days = len(working_days)
            
            # Get present days only for working days
            present_days = 0
            for work_day in working_days:
                if attendance.filter(date=work_day, is_present=True).exists():
                    present_days += 1
            
            # Calculate attendance percentage
            attendance_percentage = (present_days / total_working_days * 100) if total_working_days > 0 else 0
            
            # Get attendance by month
            attendance_by_month = {}
            for att in attendance:
                month_key = att.date.strftime('%B %Y')
                if month_key not in attendance_by_month:
                    attendance_by_month[month_key] = {'present': 0, 'absent': 0, 'total': 0}
                
                attendance_by_month[month_key]['total'] += 1
                if att.is_present:
                    attendance_by_month[month_key]['present'] += 1
                else:
                    attendance_by_month[month_key]['absent'] += 1
            
            # Log for debugging
            logger.info(f"Student: {student.user.username}, Working days: {total_working_days}, Present: {present_days}")
            logger.info(f"Working days count: {len(working_days)}")
            logger.info(f"First few working days: {[d.isoformat() for d in working_days[:5]]}")
            
            return Response({
                'attendance': serializer.data,
                'statistics': {
                    'total_working_days': total_working_days,
                    'present_days': present_days,
                    'absent_days': total_working_days - present_days,
                    'attendance_percentage': round(attendance_percentage, 2)
                },
                'monthly_statistics': attendance_by_month,
                'admission_date': student.admission_date,
                'holidays': [{'date': date_obj.isoformat(), 'name': name} for date_obj, name in holiday_dates.items()]
            })
        except Student.DoesNotExist:
            return Response(
                {"detail": "Student profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )
def get_user_enrollments(request):
    """Get enrollments for the current user"""
    if not request.user.is_authenticated:
        return Response(
            {"detail": "Authentication required"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        # Handle potential errors by using a try/except for each enrollment
        enrollments = CourseEnrollment.objects.filter(user=request.user)
        data = []
        for enrollment in enrollments:
            try:
                data.append({
                    'id': enrollment.id,
                    'course': enrollment.course.id,
                    'course_title': enrollment.course.title,
                    'enrolled_date': enrollment.enrolled_date
                })
            except Exception:
                # Skip any problematic enrollments
                continue
        return Response(data)
    except Exception as e:
        logger.error(f"Error fetching user enrollments: {str(e)}")
        # Return empty list instead of error to prevent frontend issues
        return Response([])
        
class AttendanceAPIView(APIView):
    """Simple API endpoint to get attendance status for the current day"""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'student':
            return Response(
                {"detail": "Only students can access attendance status."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            student = Student.objects.get(user=request.user)
            today = date.today()
            
            # Check if attendance exists for today
            attendance = Attendance.objects.filter(student=student, date=today).first()
            
            if attendance:
                return Response({
                    'date': today,
                    'is_present': attendance.is_present,
                    'login_time': attendance.login_time
                })
            else:
                return Response({
                    'date': today,
                    'is_present': False,
                    'message': 'No attendance record for today'
                })
                
        except Student.DoesNotExist:
            return Response(
                {"detail": "Student profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

@api_view(['POST'])
@permission_classes([IsFaculty])
def mark_attendance(request):
    """API endpoint for faculty to mark student attendance"""
    try:
        student_id = request.data.get('student_id')
        date_str = request.data.get('date')
        is_present = request.data.get('is_present', False)
        remarks = request.data.get('remarks', '')
        
        if not student_id or not date_str:
            return Response(
                {"detail": "Student ID and date are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Parse date
        try:
            attendance_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {"detail": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get student
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response(
                {"detail": "Student not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if date is valid (between admission date and today)
        today = date.today()
        if attendance_date > today:
            return Response(
                {"detail": "Cannot mark attendance for future dates."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if attendance_date < student.admission_date:
            return Response(
                {"detail": "Cannot mark attendance before student's admission date."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if date is a Sunday or holiday
        if attendance_date.weekday() == 6:  # Sunday
            return Response(
                {"detail": "Cannot mark attendance for Sundays."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check if date is a holiday
        try:
            holiday = Holiday.objects.get(date=attendance_date)
            return Response(
                {"detail": f"Cannot mark attendance for holiday: {holiday.name}."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Holiday.DoesNotExist:
            pass  # Not a holiday, continue
        
        # Create or update attendance record
        attendance, created = Attendance.objects.update_or_create(
            student=student,
            date=attendance_date,
            defaults={'is_present': is_present, 'remarks': remarks}
        )
        
        return Response({
            'id': attendance.id,
            'student_id': student.id,
            'student_name': student.user.username,
            'date': attendance_date,
            'is_present': attendance.is_present,
            'remarks': attendance.remarks,
            'created': created
        })
        
    except Exception as e:
        return Response(
            {"detail": f"Error marking attendance: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsFaculty])
def get_student_attendance_dates(request, student_id):
    """Get available dates for marking attendance for a specific student"""
    try:
        student = Student.objects.get(id=student_id)
        
        # Get admission date and today's date
        admission_date = student.admission_date
        today = date.today()
        
        # Get all dates between admission date and today
        all_dates = []
        current_date = admission_date
        while current_date <= today:
            all_dates.append(current_date)
            current_date += timedelta(days=1)
        
        # Get existing attendance records
        existing_attendance = Attendance.objects.filter(
            student=student
        ).values_list('date', 'is_present')
        
        attendance_status = {}
        for att_date, is_present in existing_attendance:
            attendance_status[att_date.isoformat()] = is_present
        
        # Format response
        date_range = {
            'student_id': student.id,
            'student_name': student.user.username,
            'admission_date': admission_date.isoformat(),
            'today': today.isoformat(),
            'attendance_status': attendance_status
        }
        
        return Response(date_range)
        
    except Student.DoesNotExist:
        return Response(
            {"detail": "Student not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"detail": f"Error retrieving attendance dates: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_student_attendance_stats(request, student_id):
    """Get attendance statistics for a specific student"""
    try:
        student = Student.objects.get(id=student_id)
        admission_date = student.admission_date
        today = date.today()
        
        # Get holidays
        holidays = Holiday.objects.filter(date__gte=admission_date, date__lte=today)
        holiday_dates = [h.date for h in holidays]
        
        # Calculate working days (excluding Sundays and holidays)
        working_days = []
        current_date = admission_date
        while current_date <= today:
            # Skip Sundays (weekday 6) and holidays
            if current_date.weekday() != 6 and current_date not in holiday_dates:
                working_days.append(current_date)
            current_date += timedelta(days=1)
        
        # Get student's attendance records
        attendance = Attendance.objects.filter(
            student=student,
            date__gte=admission_date,
            date__lte=today
        )
        
        # Calculate attendance statistics
        total_working_days = len(working_days)
        
        # Get present days only for working days
        present_days = 0
        for work_day in working_days:
            if attendance.filter(date=work_day, is_present=True).exists():
                present_days += 1
        
        # Calculate attendance percentage
        attendance_percentage = (present_days / total_working_days * 100) if total_working_days > 0 else 0
        
        return Response({
            'student_id': student.id,
            'student_name': student.user.username,
            'total_working_days': total_working_days,
            'present_days': present_days,
            'absent_days': total_working_days - present_days,
            'percentage': round(attendance_percentage, 2)
        })
        
    except Student.DoesNotExist:
        return Response(
            {"detail": "Student not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"detail": f"Error retrieving attendance statistics: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )