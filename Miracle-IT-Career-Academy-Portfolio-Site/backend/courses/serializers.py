from rest_framework import serializers
from .models import Course, Video, Quiz, CourseSyllabus, SyllabusItem, CourseEnrollment, Notification, CourseEnquiry, Payment

class SyllabusItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SyllabusItem
        fields = ['id', 'title', 'description', 'order', 'module']

class CourseSyllabusSerializer(serializers.ModelSerializer):
    items = SyllabusItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = CourseSyllabus
        fields = ['id', 'title', 'order', 'course', 'items', 'last_updated']

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['id', 'title', 'url', 'order', 'preview_duration']

class CourseSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)
    students_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'image', 'duration', 'level', 
                 'created_at', 'internship_duration', 'is_certified', 'last_updated',
                 'price', 'discount_price', 'students_count']
                 
    def get_students_count(self, obj):
        # Count students directly from Student model
        from users.models import Student
        return Student.objects.filter(course=obj).count()

class CourseDetailSerializer(serializers.ModelSerializer):
    syllabus_modules = CourseSyllabusSerializer(many=True, read_only=True)
    videos = VideoSerializer(many=True, read_only=True)
    students_count = serializers.SerializerMethodField()
    preview_video = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'image', 'duration', 'level', 
                 'created_at', 'internship_duration', 'is_certified', 'last_updated',
                 'syllabus_modules', 'videos', 'price', 'discount_price', 'students_count',
                 'preview_video_url', 'preview_duration', 'preview_video']
                 
    def get_students_count(self, obj):
        # Count students directly from Student model
        from users.models import Student
        return Student.objects.filter(course=obj).count()
    
    def get_preview_video(self, obj):
        return obj.get_first_video_as_preview()

class QuizSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)
    
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'image', 'questions', 'time', 'difficulty']

class CourseEnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source='course.title')
    
    class Meta:
        model = CourseEnrollment
        fields = ['id', 'course', 'course_title', 'enrolled_date']
        read_only_fields = ['enrolled_date']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'created_at', 'is_read']
        read_only_fields = ['created_at']

class CourseEnquirySerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source='course.title')
    
    class Meta:
        model = CourseEnquiry
        fields = ['id', 'name', 'email', 'phone', 'course', 'course_title', 'message', 'status', 'created_at']
        read_only_fields = ['created_at']

class PaymentSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source='course.title')
    user_email = serializers.ReadOnlyField(source='user.email')
    
    class Meta:
        model = Payment
        fields = ['id', 'user', 'user_email', 'course', 'course_title', 'amount', 
                 'payment_id', 'order_id', 'status', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']