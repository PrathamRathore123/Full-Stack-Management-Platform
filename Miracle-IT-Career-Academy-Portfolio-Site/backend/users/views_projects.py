from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.db.models import Avg, Count, Q
from .models import Project, ProjectSubmission, StudentAchievement, Student
from .serializers import ProjectSerializer, ProjectSubmissionSerializer, StudentAchievementSerializer
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user_view(request):
    """Get current user information including student/faculty details"""
    user = request.user
    data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role
    }
    
    if user.role == 'student':
        try:
            student = user.student_profile
            data.update({
                'student_id': student.id,
                'enrollment_id': student.enrollment_id,
                'batch_id': student.batch_id if student.batch else None,
                'course_id': student.course_id if student.course else None
            })
        except:
            pass
    
    return Response(data)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])  # Changed to AllowAny to fix 404 error
def project_technologies(request):
    """Get list of all technologies used in projects"""
    # Default technologies if no projects exist yet
    default_technologies = ['React', 'Django', 'JavaScript', 'Python', 'HTML/CSS', 'Node.js', 'Angular', 'Vue.js']
    
    try:
        technologies = set()
        projects = Project.objects.all()
        
        if projects.exists():
            for project in projects:
                if project.technologies:
                    technologies.update(project.technologies)
        
        # If no technologies found, use defaults
        if not technologies:
            technologies = default_technologies
            
        return Response(sorted(list(technologies)))
    except Exception as e:
        logger.error(f"Error in project_technologies: {str(e)}")
        return Response(default_technologies)

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Project.objects.all()
        
        # Filter by batch_id if provided
        batch_id = self.request.query_params.get('batch_id')
        if batch_id:
            queryset = queryset.filter(batch_id=batch_id)
        
        # Filter by technology if provided
        technology = self.request.query_params.get('technology')
        if technology:
            queryset = queryset.filter(technologies__contains=[technology])
        
        # Filter by status if provided
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """Get leaderboard of students based on project submissions"""
        batch_id = request.query_params.get('batch_id')
        
        # Base query for approved submissions
        submissions = ProjectSubmission.objects.filter(status='approved')
        
        # Filter by batch if provided
        if batch_id:
            submissions = submissions.filter(student__batch_id=batch_id)
        
        # Get leaderboard data
        leaderboard = submissions.values(
            'student', 'student__user__username', 'student__enrollment_id'
        ).annotate(
            completed_projects=Count('id'),
            average_grade=Avg('grade')
        ).order_by('-completed_projects', '-average_grade')[:10]
        
        # Format response
        result = []
        for entry in leaderboard:
            result.append({
                'student_id': entry['student'],
                'student_name': entry['student__user__username'],
                'enrollment_id': entry['student__enrollment_id'],
                'completed_projects': entry['completed_projects'],
                'average_grade': entry['average_grade']
            })
        
        return Response(result)

class ProjectSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = ProjectSubmission.objects.all()
        
        # Filter by project_id if provided
        project_id = self.request.query_params.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        # Filter by student_id if provided
        student_id = self.request.query_params.get('student_id')
        if student_id:
            queryset = queryset.filter(student_id=student_id)
            
        return queryset
    
    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """Review a project submission"""
        submission = self.get_object()
        
        # Update submission with review data
        submission.status = request.data.get('status', submission.status)
        submission.grade = request.data.get('grade', submission.grade)
        submission.feedback = request.data.get('feedback', submission.feedback)
        submission.save()
        
        # If approved, check if student should get an achievement
        if submission.status == 'approved':
            self._check_and_award_achievements(submission)
        
        return Response(self.get_serializer(submission).data)
    
    def _check_and_award_achievements(self, submission):
        """Check and award achievements based on project completion"""
        student = submission.student
        project = submission.project
        
        # Count approved submissions for this student
        approved_count = ProjectSubmission.objects.filter(
            student=student,
            status='approved'
        ).count()
        
        # Award achievements based on number of completed projects
        if approved_count == 1:
            StudentAchievement.objects.get_or_create(
                student=student,
                name="First Project Completed",
                defaults={
                    'description': "Completed your first project successfully",
                    'icon': 'star'
                }
            )
        elif approved_count == 5:
            StudentAchievement.objects.get_or_create(
                student=student,
                name="Project Master",
                defaults={
                    'description': "Completed 5 projects successfully",
                    'icon': 'trophy'
                }
            )
        elif approved_count == 10:
            StudentAchievement.objects.get_or_create(
                student=student,
                name="Project Guru",
                defaults={
                    'description': "Completed 10 projects successfully",
                    'icon': 'crown'
                }
            )
        
        # Award achievement based on project difficulty
        if project.difficulty == 'advanced':
            StudentAchievement.objects.get_or_create(
                student=student,
                name="Advanced Challenge Completed",
                defaults={
                    'description': "Successfully completed an advanced difficulty project",
                    'icon': 'medal'
                }
            )
    
    @action(detail=False, methods=['post'])
    def mark_submitted(self, request):
        """Mark a project as submitted for a student by enrollment ID"""
        enrollment_id = request.data.get('enrollment_id')
        project_id = request.data.get('project_id')
        
        if not enrollment_id or not project_id:
            return Response(
                {"detail": "Enrollment ID and project ID are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            student = Student.objects.get(enrollment_id=enrollment_id)
            project = Project.objects.get(id=project_id)
            
            # Create submission with minimal data
            submission, created = ProjectSubmission.objects.get_or_create(
                student=student,
                project=project,
                defaults={
                    'repository_url': 'https://github.com/marked-by-faculty',
                    'status': 'submitted'
                }
            )
            
            if not created:
                return Response(
                    {"detail": "Submission already exists for this student and project."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response(
                {"detail": f"Project marked as submitted for student {enrollment_id}."},
                status=status.HTTP_201_CREATED
            )
        except Student.DoesNotExist:
            return Response(
                {"detail": f"Student with enrollment ID {enrollment_id} not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Project.DoesNotExist:
            return Response(
                {"detail": f"Project with ID {project_id} not found."},
                status=status.HTTP_404_NOT_FOUND
            )

class StudentAchievementViewSet(viewsets.ModelViewSet):
    serializer_class = StudentAchievementSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = StudentAchievement.objects.all()
        
        # Filter by student_id if provided
        student_id = self.request.query_params.get('student_id')
        if student_id:
            queryset = queryset.filter(student_id=student_id)
            
        return queryset