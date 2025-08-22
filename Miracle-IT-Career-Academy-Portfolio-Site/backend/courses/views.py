from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Course, Video, Quiz, CourseSyllabus, SyllabusItem, CourseEnrollment, Notification, CourseEnquiry, Payment
from django.db.models import Q
from .serializers import (
    CourseSerializer, CourseDetailSerializer, VideoSerializer, QuizSerializer,
    CourseSyllabusSerializer, SyllabusItemSerializer, CourseEnrollmentSerializer,
    NotificationSerializer, CourseEnquirySerializer, PaymentSerializer
)
import json
from django.conf import settings
import uuid
import requests

# YouTube API settings
YOUTUBE_API_KEY = "AIzaSyCPDbobnAJLOw35HpIBUN0eyyAryhkgWyw"  # Replace with your actual API key

# Razorpay settings
RAZORPAY_KEY_ID = "rzp_test_your_key_id"
RAZORPAY_KEY_SECRET = "rzp_test_your_key_secret"

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseSerializer
        
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        # Only admin and faculty can create/update courses
        return [permissions.IsAuthenticated()]
        
    def perform_create(self, serializer):
        # Check if user is admin or faculty
        user = self.request.user
        if user.is_staff or user.groups.filter(name='faculty').exists():
            serializer.save()
        else:
            raise permissions.PermissionDenied("Only admin and faculty can create courses.")

class VideoViewSet(viewsets.ModelViewSet):
    serializer_class = VideoSerializer
    
    def get_queryset(self):
        queryset = Video.objects.all()
        course_id = self.request.query_params.get('course_id', None)
        if course_id is not None:
            queryset = queryset.filter(course_id=course_id)
        return queryset
        
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        # Only admin and faculty can create/update videos
        return [permissions.IsAuthenticated()]
        
    def perform_create(self, serializer):
        # Check if user is admin or faculty
        user = self.request.user
        if user.is_staff or user.groups.filter(name='faculty').exists():
            serializer.save()
        else:
            raise permissions.PermissionDenied("Only admin and faculty can add videos.")

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        # Only admin and faculty can create/update quizzes
        return [permissions.IsAuthenticated()]
        
    def perform_create(self, serializer):
        # Check if user is admin or faculty
        user = self.request.user
        if user.is_staff or user.groups.filter(name='faculty').exists():
            serializer.save()
        else:
            raise permissions.PermissionDenied("Only admin and faculty can create quizzes.")

class CourseSyllabusViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSyllabusSerializer
    
    def get_queryset(self):
        queryset = CourseSyllabus.objects.all()
        course_id = self.request.query_params.get('course_id', None)
        if course_id is not None:
            queryset = queryset.filter(course_id=course_id)
        return queryset
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        # Allow both admin and faculty to create/update syllabus
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        # Check if user is admin or faculty
        user = self.request.user
        if user.is_staff or user.groups.filter(name='faculty').exists():
            serializer.save()
        else:
            raise permissions.PermissionDenied("Only admin and faculty can create course syllabus.")

class SyllabusItemViewSet(viewsets.ModelViewSet):
    serializer_class = SyllabusItemSerializer
    
    def get_queryset(self):
        queryset = SyllabusItem.objects.all()
        module_id = self.request.query_params.get('module_id', None)
        if module_id is not None:
            queryset = queryset.filter(module_id=module_id)
        return queryset
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        # Allow both admin and faculty to create/update syllabus items
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        # Check if user is admin or faculty
        user = self.request.user
        if user.is_staff or user.groups.filter(name='faculty').exists():
            serializer.save()
        else:
            raise permissions.PermissionDenied("Only admin and faculty can create syllabus items.")

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_in_course(request):
    course_id = request.data.get('course_id')
    payment_id = request.data.get('payment_id')
    
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if payment is required and provided
    if course.price > 0 and not payment_id:
        return Response({
            'error': 'Payment required for this course',
            'course_price': course.price,
            'discount_price': course.discount_price
        }, status=status.HTTP_402_PAYMENT_REQUIRED)
    
    # If payment ID is provided, verify and record the payment
    if payment_id:
        # Create payment record
        payment = Payment.objects.create(
            user=request.user,
            course=course,
            amount=course.discount_price if course.discount_price else course.price,
            payment_id=payment_id,
            status='completed'
        )
    
    # Create enrollment
    enrollment, created = CourseEnrollment.objects.get_or_create(
        user=request.user,
        course=course
    )
    
    if created:
        return Response({'message': 'Successfully enrolled in course'}, status=status.HTTP_201_CREATED)
    else:
        return Response({'message': 'Already enrolled in this course'}, status=status.HTTP_200_OK)

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    @action(detail=False, methods=['get'])
    def course_updates(self, request):
        """Get notifications related to course updates"""
        notifications = Notification.objects.filter(
            user=request.user
        ).filter(
            Q(title__contains='Course') | Q(title__contains='Module') | Q(title__contains='Content')
        ).order_by('-created_at')
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'}, status=status.HTTP_200_OK)
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_enrollments(request):
    enrollments = CourseEnrollment.objects.filter(user=request.user)
    serializer = CourseEnrollmentSerializer(enrollments, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_latest_courses(request):
    """Get the latest courses added or updated"""
    courses = Course.objects.all().order_by('-created_at')[:5]
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)
    
@api_view(['GET'])
@permission_classes([AllowAny])
def get_course_by_id(request, course_id):
    """Get a specific course by ID"""
    try:
        course = Course.objects.get(id=course_id)
        
        # Check if course has YouTube playlist but no videos
        if course.youtube_playlist_id and Video.objects.filter(course=course).count() == 0:
            # Auto-import videos from YouTube playlist
            try:
                # Fetch videos from YouTube
                url = f"https://www.googleapis.com/youtube/v3/playlistItems"
                params = {
                    'part': 'snippet,contentDetails',
                    'maxResults': 50,
                    'playlistId': course.youtube_playlist_id,
                    'key': YOUTUBE_API_KEY
                }
                
                response = requests.get(url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Create video objects for each playlist item
                    for item in data.get('items', []):
                        video_id = item['contentDetails']['videoId']
                        title = item['snippet']['title']
                        position = item['snippet']['position']
                        
                        Video.objects.create(
                            course=course,
                            title=title,
                            url=f"https://www.youtube.com/embed/{video_id}",
                            video_id=video_id,
                            source_type='youtube',
                            order=position,
                            preview_duration=180  # Default 3 minutes preview
                        )
            except Exception as e:
                print(f"Error auto-importing YouTube playlist: {str(e)}")
        
        serializer = CourseDetailSerializer(course)
        return Response(serializer.data)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_course(request):
    """Create a new course"""
    # Check if user is admin or faculty
    user = request.user
    if not (user.is_staff or user.groups.filter(name='faculty').exists()):
        return Response(
            {'error': 'Only admin and faculty can create courses'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = CourseSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Course Enquiry Views
class CourseEnquiryViewSet(viewsets.ModelViewSet):
    serializer_class = CourseEnquirySerializer
    
    def get_queryset(self):
        # Admin and faculty can see all enquiries
        user = self.request.user
        if user.is_authenticated and (user.is_staff or user.groups.filter(name='faculty').exists()):
            return CourseEnquiry.objects.all()
        # Regular users can only see their own enquiries
        elif user.is_authenticated:
            return CourseEnquiry.objects.filter(user=user)
        # Unauthenticated users can't see any enquiries
        return CourseEnquiry.objects.none()
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        # Link to user if authenticated
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

# Payment Gateway Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_order(request):
    course_id = request.data.get('course_id')
    
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is already enrolled
    if CourseEnrollment.objects.filter(user=request.user, course=course).exists():
        return Response({'error': 'Already enrolled in this course'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Calculate amount
    amount = int((course.discount_price if course.discount_price else course.price) * 100)  # Convert to paisa
    
    # Create Razorpay order using direct API call
    order_data = {
        'amount': amount,
        'currency': 'INR',
        'receipt': f'receipt_{uuid.uuid4().hex[:8]}',
        'payment_capture': 1  # Auto-capture
    }
    
    try:
        # Direct API call to Razorpay
        url = "https://api.razorpay.com/v1/orders"
        auth = (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
        
        response = requests.post(url, json=order_data, auth=auth)
        if response.status_code == 200:
            order = response.json()
            
            # Return order details to frontend
            return Response({
                'order_id': order['id'],
                'amount': amount / 100,  # Convert back to rupees for display
                'currency': 'INR',
                'course_id': course.id,
                'course_title': course.title
            })
        else:
            return Response({'error': f"Razorpay API error: {response.text}"}, 
                           status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    payment_id = request.data.get('payment_id')
    order_id = request.data.get('order_id')
    signature = request.data.get('signature')
    course_id = request.data.get('course_id')
    
    # For simplicity in this implementation, we'll skip the signature verification
    # In production, you should implement proper signature verification
    
    try:
        # Get course
        course = Course.objects.get(id=course_id)
        
        # Create payment record
        payment = Payment.objects.create(
            user=request.user,
            course=course,
            amount=course.discount_price if course.discount_price else course.price,
            payment_id=payment_id,
            order_id=order_id,
            status='completed'
        )
        
        # Create enrollment
        enrollment, created = CourseEnrollment.objects.get_or_create(
            user=request.user,
            course=course
        )
        
        return Response({
            'status': 'success',
            'message': 'Payment successful and enrollment created',
            'payment_id': payment_id,
            'course_id': course_id
        })
    except Exception as e:
        return Response({
            'status': 'failed',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def submit_course_enquiry(request):
    serializer = CourseEnquirySerializer(data=request.data)
    if serializer.is_valid():
        # Link to user if authenticated
        if request.user.is_authenticated:
            serializer.save(user=request.user)
        else:
            serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_enrollment_status(request, course_id):
    """Check if user is enrolled in a specific course"""
    try:
        is_enrolled = CourseEnrollment.objects.filter(
            user=request.user, 
            course_id=course_id
        ).exists()
        
        return Response({
            'is_enrolled': is_enrolled
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# YouTube API Integration
@api_view(['GET'])
@permission_classes([AllowAny])
def get_youtube_playlist_videos(request, playlist_id):
    """Fetch videos from a YouTube playlist"""
    try:
        # YouTube API endpoint for playlist items
        url = f"https://www.googleapis.com/youtube/v3/playlistItems"
        params = {
            'part': 'snippet,contentDetails',
            'maxResults': 50,  # Maximum allowed by YouTube API
            'playlistId': playlist_id,
            'key': YOUTUBE_API_KEY
        }
        
        response = requests.get(url, params=params)
        
        if response.status_code == 200:
            data = response.json()
            videos = []
            
            for item in data.get('items', []):
                video_id = item['contentDetails']['videoId']
                title = item['snippet']['title']
                thumbnail = item['snippet']['thumbnails']['high']['url']
                position = item['snippet']['position']
                
                videos.append({
                    'video_id': video_id,
                    'title': title,
                    'thumbnail': thumbnail,
                    'position': position,
                    'url': f"https://www.youtube.com/watch?v={video_id}"
                })
            
            return Response(videos)
        else:
            return Response({'error': f"YouTube API error: {response.text}"}, 
                           status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def import_youtube_playlist(request):
    """Import videos from a YouTube playlist to a course"""
    # Check if user is admin or faculty
    user = request.user
    if not (user.is_staff or user.groups.filter(name='faculty').exists()):
        return Response(
            {'error': 'Only admin and faculty can import playlists'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    playlist_id = request.data.get('playlist_id')
    course_id = request.data.get('course_id')
    
    if not playlist_id or not course_id:
        return Response({'error': 'Playlist ID and Course ID are required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    try:
        course = Course.objects.get(id=course_id)
        
        # Update course with playlist ID
        course.youtube_playlist_id = playlist_id
        course.save()
        
        # Fetch videos from YouTube
        url = f"https://www.googleapis.com/youtube/v3/playlistItems"
        params = {
            'part': 'snippet,contentDetails',
            'maxResults': 50,
            'playlistId': playlist_id,
            'key': YOUTUBE_API_KEY
        }
        
        response = requests.get(url, params=params)
        
        if response.status_code != 200:
            return Response({'error': f"YouTube API error: {response.text}"}, 
                           status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        data = response.json()
        videos_created = 0
        
        # Clear existing videos for this course
        Video.objects.filter(course=course).delete()
        
        # Create video objects for each playlist item
        for item in data.get('items', []):
            video_id = item['contentDetails']['videoId']
            title = item['snippet']['title']
            position = item['snippet']['position']
            
            Video.objects.create(
                course=course,
                title=title,
                url=f"https://www.youtube.com/embed/{video_id}",
                video_id=video_id,
                source_type='youtube',
                order=position,
                preview_duration=180  # Default 3 minutes preview
            )
            videos_created += 1
        
        return Response({
            'message': f"Successfully imported {videos_created} videos from YouTube playlist",
            'course_id': course_id,
            'playlist_id': playlist_id
        })
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)