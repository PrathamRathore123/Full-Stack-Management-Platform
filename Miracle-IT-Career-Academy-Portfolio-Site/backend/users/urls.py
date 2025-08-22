from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, CustomTokenObtainPairView, StudentLoginView, ProfileView,
    CreateAdminView, CreateFacultyView, CreateStudentView, ListFacultyView,
    ListStudentView, BatchViewSet, WorkshopViewSet, StudentViewSet,
    WorkshopRegistrationViewSet, CertificateViewSet, IntegratedDashboardView,
    AttendanceViewSet, get_user_enrollments, AttendanceAPIView,
    mark_attendance, get_student_attendance_dates, get_student_attendance_stats
)
from .views_projects import (
    ProjectViewSet, ProjectSubmissionViewSet, StudentAchievementViewSet,
    current_user_view, project_technologies
)
from .views_fees import (
    FeeStructureViewSet, StudentFeeViewSet, FeePaymentViewSet,
    AdminFeeReportView, StudentFeeDetailView, FacultyStudentFeeView, AuthTestView,
    student_fee_detail_view, download_receipt_view, AdminNotificationViewSet
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'batches', BatchViewSet, basename='batch')
router.register(r'workshops', WorkshopViewSet, basename='workshop')
router.register(r'workshop-registrations', WorkshopRegistrationViewSet, basename='workshop-registration')
router.register(r'certificates', CertificateViewSet, basename='certificate')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'project-submissions', ProjectSubmissionViewSet, basename='project-submission')
router.register(r'student-achievements', StudentAchievementViewSet, basename='student-achievement')

# Fee Management System routes
router.register(r'fee-structures', FeeStructureViewSet, basename='fee-structure')
router.register(r'student-fees', StudentFeeViewSet, basename='student-fees')
router.register(r'fee-payments', FeePaymentViewSet, basename='fee-payment')
router.register(r'admin-notifications', AdminNotificationViewSet, basename='admin-notification')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('student-login/', StudentLoginView.as_view(), name='student_login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('create-admin/', CreateAdminView.as_view(), name='create_admin'),
    path('create-faculty/', CreateFacultyView.as_view(), name='create_faculty'),
    path('create-student/', CreateStudentView.as_view(), name='create_student'),
    path('faculty/', ListFacultyView.as_view(), name='list_faculty'),
    path('students/', ListStudentView.as_view(), name='list_students'),
    path('dashboard/', IntegratedDashboardView.as_view(), name='dashboard'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('enrollments/', get_user_enrollments, name='user-enrollments'),
    path('attendance-status/', AttendanceAPIView.as_view(), name='attendance-status'),
    # Faculty attendance management endpoints
    path('mark-attendance/', mark_attendance, name='mark-attendance'),
    path('student-attendance-dates/<int:student_id>/', get_student_attendance_dates, name='student-attendance-dates'),
    path('student-attendance-stats/<int:student_id>/', get_student_attendance_stats, name='student-attendance-stats'),
    # Project management endpoints
    path('current-user/', current_user_view, name='current-user'),
    path('projects/technologies/', project_technologies, name='project-technologies'),
    path('project-leaderboard/', ProjectViewSet.as_view({'get': 'leaderboard'}), name='project-leaderboard'),
    path('project-submissions/mark-submitted/', ProjectSubmissionViewSet.as_view({'post': 'mark_submitted'}), name='mark-project-submitted'),
    # Add the new endpoint for assigning students to batches
    path('batches/<int:pk>/assign-students/', BatchViewSet.as_view({'post': 'assign_students'}), name='assign_students_to_batch'),
    # Add endpoint for getting students in a batch
    path('batches/<int:pk>/students/', BatchViewSet.as_view({'get': 'get_students'}), name='batch_students'),
    
    # Fee Management System endpoints
    path('fee-reports/', AdminFeeReportView.as_view(), name='fee-reports'),
    path('student-fees/details/', student_fee_detail_view, name='student-fee-details'),
    path('student-fee-details/', StudentFeeDetailView.as_view(), name='student-fee-details-alt'),
    path('faculty-student-fees/', FacultyStudentFeeView.as_view(), name='faculty-student-fees'),
    # Fee payment specific endpoints
    path('receipt/<str:receipt_number>/', download_receipt_view, name='download-receipt'),
    path('download-receipt/', download_receipt_view, name='download-receipt-alt'),
    # Debug endpoint
    path('auth-test/', AuthTestView.as_view(), name='auth-test'),
    # Faculty specific endpoints
    path('faculty/workshop-registrations/', WorkshopRegistrationViewSet.as_view({'get': 'list'}), name='faculty-workshop-registrations'),
    path('faculty/past-workshop-attendees/', WorkshopRegistrationViewSet.as_view({'get': 'past_attendees'}), name='faculty-past-workshop-attendees'),
]
