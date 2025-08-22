from rest_framework import serializers
from .models import (
    CustomUser, Student, Faculty, Admin, Workshop, Certificate, WorkshopRegistration, 
    Batch, Attendance, Holiday, Project, ProjectSubmission, StudentAchievement,
    FeeStructure, FeeInstallment, StudentFee, FeePayment, FeeDiscount, FeeFine
)

# Try to import AdminNotification, handle gracefully if it doesn't exist
try:
    from .models import AdminNotification
except ImportError:
    AdminNotification = None
from django.contrib.auth.password_validation import validate_password
from datetime import datetime, date
from courses.models import Course, CourseSyllabus, SyllabusItem, Video, Quiz, CourseEnrollment, Notification
from django.utils import timezone
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role']

from .models import Batch, Student
from django.contrib.auth.models import User
from courses.serializers import CourseSerializer

class BatchSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    students_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Batch
        fields = ['id', 'name', 'course', 'created_at', 'students_count']
        read_only_fields = ['created_at']
    
    def get_students_count(self, obj):
        # Count students directly from Student model
        from users.models import Student
        count = Student.objects.filter(batch=obj).count()
        # Debug log
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Batch {obj.name} (ID: {obj.id}) has {count} students")
        return count

class StudentSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    course = CourseSerializer(read_only=True)
    batch = BatchSerializer(read_only=True)
    
    class Meta:
        model = Student
        fields = ['id', 'user', 'enrollment_id', 'date_of_birth', 'admission_date', 'course', 'batch']
    
    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email
        }

class FacultySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Faculty
        fields = ['id', 'user', 'department']

class AdminSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Admin
        fields = ['id', 'user', 'is_super_admin']

# Serializers for integrated API
class SyllabusItemIntegratedSerializer(serializers.ModelSerializer):
    class Meta:
        model = SyllabusItem
        fields = ['id', 'title', 'description', 'order']

class CourseSyllabusIntegratedSerializer(serializers.ModelSerializer):
    items = SyllabusItemIntegratedSerializer(many=True, read_only=True)
    
    class Meta:
        model = CourseSyllabus
        fields = ['id', 'title', 'order', 'items', 'last_updated']

class VideoIntegratedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['id', 'title', 'url', 'order']

class QuizIntegratedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'image', 'questions', 'time', 'difficulty']

class CourseIntegratedSerializer(serializers.ModelSerializer):
    syllabus_modules = CourseSyllabusIntegratedSerializer(many=True, read_only=True)
    videos = VideoIntegratedSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'image', 'duration', 'level', 
                 'created_at', 'internship_duration', 'is_certified', 'last_updated',
                 'syllabus_modules', 'videos']

class CourseEnrollmentIntegratedSerializer(serializers.ModelSerializer):
    course = CourseIntegratedSerializer(read_only=True)
    
    class Meta:
        model = CourseEnrollment
        fields = ['id', 'course', 'enrolled_date']

class NotificationIntegratedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'created_at', 'is_read']

class IntegratedDashboardSerializer(serializers.Serializer):
    """
    Integrated serializer that combines user profile, courses, workshops, certificates, and notifications
    """
    user = serializers.SerializerMethodField()
    courses = serializers.SerializerMethodField()
    enrollments = serializers.SerializerMethodField()
    workshops = serializers.SerializerMethodField()
    certificates = serializers.SerializerMethodField()
    notifications = serializers.SerializerMethodField()
    quizzes = serializers.SerializerMethodField()
    
    def get_user(self, obj):
        user = obj
        data = UserSerializer(user).data
        
        if user.role == 'student':
            try:
                student_data = StudentSerializer(user.student_profile).data
                data.update({'student_profile': student_data})
            except:
                pass
        elif user.role == 'faculty':
            try:
                faculty_data = FacultySerializer(user.faculty_profile).data
                data.update({'faculty_profile': faculty_data})
            except:
                pass
        elif user.role == 'admin':
            try:
                admin_data = AdminSerializer(user.admin_profile).data
                data.update({'admin_profile': admin_data})
            except:
                pass
            
        return data
    
    def get_courses(self, obj):
        courses = Course.objects.all()
        return CourseIntegratedSerializer(courses, many=True).data
    
    def get_enrollments(self, obj):
        user = obj
        enrollments = CourseEnrollment.objects.filter(user=user)
        return CourseEnrollmentIntegratedSerializer(enrollments, many=True).data
    
    def get_workshops(self, obj):
        workshops = Workshop.objects.all()
        return WorkshopSerializer(workshops, many=True).data
    
    def get_certificates(self, obj):
        # Check if Certificate model has a user field, otherwise return all certificates
        if hasattr(Certificate, 'user'):
            certificates = Certificate.objects.filter(user=obj)
        else:
            certificates = Certificate.objects.all()
        return CertificateSerializer(certificates, many=True).data
    
    def get_notifications(self, obj):
        user = obj
        notifications = Notification.objects.filter(user=user).order_by('-created_at')
        return NotificationIntegratedSerializer(notifications, many=True).data
    
    def get_quizzes(self, obj):
        quizzes = Quiz.objects.all()
        return QuizIntegratedSerializer(quizzes, many=True).data

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'role']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role'],
        )
        role = validated_data['role']
        if role == 'student':
        # Use raw SQL to create student with created_at field
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO users_student 
                    (user_id, enrollment_id, date_of_birth, created_at, updated_at) 
                    VALUES (%s, %s, %s, NOW(), NOW())
                    """,
                    [
                        user.id, 
                        f"ENRL{datetime.now().year}{user.id}",
                        datetime.now().date()
                    ]
                    )
        elif role == 'faculty':
            Faculty.objects.create(user=user)
        elif role == 'admin':
            Admin.objects.create(user=user)
        return user


class CreateAdminSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    is_super_admin = serializers.BooleanField(default=False)

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role='admin',
        )
        Admin.objects.create(
            user=user,
            is_super_admin=validated_data.get('is_super_admin', False)
        )
        return user

class CreateFacultySerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    department = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role='faculty',
        )
        Faculty.objects.create(
            user=user,
            department=validated_data.get('department', ''),
            created_by=self.context['request'].user
        )
        return user

class CreateStudentSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    enrollment_id = serializers.CharField(required=False)
    date_of_birth = serializers.DateField(required=True)
    admission_date = serializers.DateField(required=False, default=date.today)
    batch_id = serializers.IntegerField(required=False, allow_null=True)
    course_id = serializers.IntegerField(required=False, allow_null=True)
    password = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
    # Use date of birth as password in ddmmyyyy format if password not provided
        dob = validated_data['date_of_birth']
        dob_password = dob.strftime('%d%m%Y')
        password = validated_data.get('password', dob_password)
        
        # Log the password being used
        import logging
        logger = logging.getLogger(__name__)
        logger.debug(f"Creating student with DOB: {dob}, password: {dob_password}")

    # Handle batch_id if provided
        batch_id = validated_data.pop('batch_id', None)
        batch = None
        if batch_id:
            try:
                batch = Batch.objects.get(id=batch_id)
            except Batch.DoesNotExist:
                raise serializers.ValidationError({"batch_id": "Batch not found"})

        # Generate enrollment ID if not provided
        if 'enrollment_id' not in validated_data or not validated_data['enrollment_id']:
            current_year = datetime.now().year
            prefix = f"ENRL{str(current_year)[-2:]}"
            existing_ids = Student.objects.filter(enrollment_id__startswith=prefix).values_list('enrollment_id', flat=True)

            if not existing_ids:
                next_id = 1
            else:
                existing_numbers = set()
                for eid in existing_ids:
                    try:
                        num = int(eid.replace(prefix, ''))
                        existing_numbers.add(num)
                    except ValueError:
                        continue

                next_id = 1
                while next_id in existing_numbers:
                    next_id += 1

            validated_data['enrollment_id'] = f"{prefix}{next_id:03d}"

        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password,
            role='student',
        )   
    
        # Use raw SQL to create student with created_at field
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO users_student 
                (user_id, enrollment_id, date_of_birth, admission_date, batch_id, created_at, course_id) 
                VALUES (%s, %s, %s, %s, %s, NOW(), %s)
                """,
                [
                    user.id, 
                    validated_data['enrollment_id'], 
                    validated_data['date_of_birth'],
                    validated_data.get('admission_date', date.today()),
                    batch.id if batch else None,
                    validated_data.get('course_id', None)
                ]
            )
        
        # Get the created student
        student = Student.objects.get(user=user)
        return student

    def update(self, instance, validated_data):
    # Update user fields
        user = instance.user
        if 'username' in validated_data:
            user.username = validated_data.get('username', user.username)
        if 'email' in validated_data:
            user.email = validated_data.get('email', user.email)
        if 'password' in validated_data and validated_data['password']:
            user.set_password(validated_data['password'])
        user.save()
    
        # Update student fields
        if 'enrollment_id' in validated_data:
            instance.enrollment_id = validated_data.get('enrollment_id', instance.enrollment_id)
        if 'date_of_birth' in validated_data:
            instance.date_of_birth = validated_data.get('date_of_birth', instance.date_of_birth)
    
        # Handle batch_id if provided
        batch_id = validated_data.pop('batch_id', None)
        if batch_id:
            try:
                batch = Batch.objects.get(id=batch_id)
                instance.batch = batch
            except Batch.DoesNotExist:
                pass
    
        # Handle course_id if provided
        course_id = validated_data.pop('course_id', None)
        if course_id:
            from courses.models import Course
            try:
                course = Course.objects.get(id=course_id)
                instance.course = course
            except Course.DoesNotExist:
                pass
    
        instance.save()
        return instance



class StudentLoginSerializer(serializers.Serializer):
    enrollment_id = serializers.CharField(required=True)
    date_of_birth = serializers.CharField(required=True)
    
    def validate_date_of_birth(self, value):
        # This field now accepts a string (password) instead of a date
        # We'll handle the conversion in the view
        return value

class WorkshopSerializer(serializers.ModelSerializer):
    date = serializers.CharField(required=True)  # explicitly mark date as required

    class Meta:
        model = Workshop
        fields = ['id', 'title', 'description', 'image', 'date', 'location', 'available_seats', 'category']

class WorkshopRegistrationSerializer(serializers.ModelSerializer):
    workshop_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = WorkshopRegistration
        fields = ['id', 'workshop_id', 'name', 'email', 'phone', 'education', 
                  'experience_level', 'special_requirements', 'registration_date']
        read_only_fields = ['id', 'registration_date']
        
    def create(self, validated_data):
        workshop_id = validated_data.pop('workshop_id')
        try:
            workshop = Workshop.objects.get(id=workshop_id)
        except Workshop.DoesNotExist:
            raise serializers.ValidationError({"workshop_id": "Workshop not found"})
            
        # Check if seats are available
        if workshop.available_seats <= 0:
            raise serializers.ValidationError({"error": "No seats available for this workshop"})
            
        # Create registration
        registration = WorkshopRegistration.objects.create(
            workshop=workshop,
            **validated_data
        )
        
        # Decrease available seats
        workshop.available_seats -= 1
        workshop.save()
        
        return registration

class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = ['id', 'title', 'description', 'image', 'duration', 'level']

class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = ['id', 'date', 'name', 'is_government']

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    enrollment_id = serializers.SerializerMethodField()
    day_of_week = serializers.SerializerMethodField()
    remarks = serializers.CharField(required=False, allow_blank=True, default='')
    
    class Meta:
        model = Attendance
        fields = ['id', 'student', 'student_name', 'enrollment_id', 'date', 'day_of_week', 'is_present', 'login_time', 'remarks']
        read_only_fields = ['login_time']
    
    def get_student_name(self, obj):
        return obj.student.user.username
        
    def get_enrollment_id(self, obj):
        return obj.student.enrollment_id
        
    def get_day_of_week(self, obj):
        return obj.date.strftime('%A')

class ProjectSerializer(serializers.ModelSerializer):
    submission_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'technologies', 'batch', 'batch_name', 
                 'difficulty', 'deadline', 'status', 'created_at', 'submission_count']
        read_only_fields = ['created_at', 'batch_name', 'submission_count']
    
    def get_submission_count(self, obj):
        return obj.submissions.count()
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        return super().create(validated_data)

class ProjectSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    enrollment_id = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectSubmission
        fields = ['id', 'project', 'student', 'student_name', 'enrollment_id', 'repository_url', 
                 'live_url', 'notes', 'status', 'grade', 'feedback', 'submission_date']
        read_only_fields = ['submission_date', 'student_name', 'enrollment_id']
    
    def get_student_name(self, obj):
        return obj.student.user.username
    
    def get_enrollment_id(self, obj):
        return obj.student.enrollment_id

class StudentAchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentAchievement
        fields = ['id', 'student', 'name', 'description', 'icon', 'created_at']
        read_only_fields = ['created_at']

# Fee Management System Serializers
class FeeStructureSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeStructure
        fields = ['id', 'name', 'course', 'registration_fee', 'tuition_fee', 'total_amount', 'installments', 'created_at', 'updated_at', 'created_by']
        read_only_fields = ['created_at', 'updated_at']

class FeeInstallmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeInstallment
        fields = ['id', 'fee_structure', 'amount', 'due_date', 'sequence']

class StudentFeeSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    fee_structure_name = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentFee
        fields = ['id', 'student', 'student_name', 'fee_structure', 'fee_structure_name', 
                 'total_amount', 'amount_paid', 'status', 'assigned_date', 'assigned_by']
        read_only_fields = ['assigned_date', 'status']
    
    def get_student_name(self, obj):
        return obj.student.user.username
    
    def get_fee_structure_name(self, obj):
        return obj.fee_structure.name

class FeePaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    
    class Meta:
        model = FeePayment
        fields = ['id', 'student_fee', 'student_name', 'amount', 'payment_date', 
                 'payment_mode', 'transaction_id', 'receipt_number', 'status', 
                 'remarks', 'recorded_by']
        read_only_fields = ['receipt_number']
    
    def get_student_name(self, obj):
        return obj.student_fee.student.user.username
    
    def create(self, validated_data):
        # Generate receipt number
        import uuid
        validated_data['receipt_number'] = f"REC-{uuid.uuid4().hex[:8].upper()}"
        
        # Set recorded_by to current user if not provided
        request = self.context.get('request')
        if request and hasattr(request, 'user') and not validated_data.get('recorded_by'):
            validated_data['recorded_by'] = request.user
            
        return super().create(validated_data)

class FeeDiscountSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    
    class Meta:
        model = FeeDiscount
        fields = ['id', 'student_fee', 'student_name', 'amount', 'discount_type', 
                 'reason', 'applied_date', 'applied_by']
        read_only_fields = ['applied_date']
    
    def get_student_name(self, obj):
        return obj.student_fee.student.user.username

class FeeFineSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    
    class Meta:
        model = FeeFine
        fields = ['id', 'student_fee', 'student_name', 'amount', 'reason', 
                 'due_date', 'is_paid', 'applied_date', 'applied_by']
        read_only_fields = ['applied_date']
    
    def get_student_name(self, obj):
        return obj.student_fee.student.user.username
    def get_student_name(self, obj):
        return obj.student_fee.student.user.username

# Only create AdminNotificationSerializer if AdminNotification model exists
if AdminNotification:
    class AdminNotificationSerializer(serializers.ModelSerializer):
        student_name = serializers.SerializerMethodField()
        time_ago = serializers.SerializerMethodField()
        
        class Meta:
            model = AdminNotification
            fields = ['id', 'title', 'message', 'notification_type', 'student', 'student_name', 
                     'amount', 'is_read', 'created_at', 'time_ago']
            read_only_fields = ['created_at']
        
        def get_student_name(self, obj):
            return obj.student.user.username if obj.student else None
        
        def get_time_ago(self, obj):
            from django.utils import timezone
            from datetime import timedelta
            
            now = timezone.now()
            diff = now - obj.created_at
            
            if diff.days > 0:
                return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
            elif diff.seconds > 3600:
                hours = diff.seconds // 3600
                return f"{hours} hour{'s' if hours > 1 else ''} ago"
            elif diff.seconds > 60:
                minutes = diff.seconds // 60
                return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
            else:
                return "Just now"
else:
    # Dummy serializer if AdminNotification doesn't exist
    class AdminNotificationSerializer(serializers.Serializer):
        pass