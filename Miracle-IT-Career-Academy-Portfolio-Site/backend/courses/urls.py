from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, QuizViewSet, CourseSyllabusViewSet, 
    SyllabusItemViewSet, NotificationViewSet, CourseEnquiryViewSet,
    VideoViewSet,
    enroll_in_course, mark_notification_read, get_user_enrollments,
    get_latest_courses, get_course_by_id, create_course,
    create_payment_order, verify_payment, submit_course_enquiry,
    check_enrollment_status, get_youtube_playlist_videos, import_youtube_playlist
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'videos', VideoViewSet, basename='video')
router.register(r'quizzes', QuizViewSet)
router.register(r'syllabus', CourseSyllabusViewSet, basename='syllabus')
router.register(r'syllabus-items', SyllabusItemViewSet, basename='syllabusitem')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'enquiries', CourseEnquiryViewSet, basename='enquiry')


urlpatterns = [
    path('', include(router.urls)),
    path('enroll/', enroll_in_course, name='enroll-in-course'),
    path('notifications/<int:notification_id>/read/', mark_notification_read, name='mark-notification-read'),
    path('user-enrollments/', get_user_enrollments, name='user-enrollments'),
    path('latest-courses/', get_latest_courses, name='latest-courses'),
    path('course/<int:course_id>/', get_course_by_id, name='course-detail'),
    path('create-course/', create_course, name='create-course'),
    path('create-payment-order/', create_payment_order, name='create-payment-order'),
    path('verify-payment/', verify_payment, name='verify-payment'),
    path('submit-enquiry/', submit_course_enquiry, name='submit-enquiry'),
    path('check-enrollment/<int:course_id>/', check_enrollment_status, name='check-enrollment'),
    path('youtube-playlist/<str:playlist_id>/', get_youtube_playlist_videos, name='youtube-playlist'),
    path('import-youtube-playlist/', import_youtube_playlist, name='import-youtube-playlist'),
]