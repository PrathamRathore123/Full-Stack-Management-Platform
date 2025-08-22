from users.models import Student, Attendance, StudentFee, Project, ProjectSubmission
from courses.models import Course
from datetime import date, datetime, timedelta
import random

class IntentProcessor:
    def __init__(self, student):
        self.student = student
    
    def process_query(self, query):
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['attendance', 'present', 'absent']):
            return self.get_attendance_data()
        elif any(word in query_lower for word in ['fee', 'payment', 'paid', 'due']):
            return self.get_fee_data()
        elif any(word in query_lower for word in ['schedule', 'today', 'class', 'upcoming']):
            return self.get_schedule_data()
        elif any(word in query_lower for word in ['certificate', 'download']):
            return self.get_certificate_data()
        elif any(word in query_lower for word in ['assignment', 'project', 'submission']):
            return self.get_assignment_data()
        elif any(word in query_lower for word in ['exam', 'test', 'countdown']):
            return self.get_exam_data()
        elif any(word in query_lower for word in ['quiz', 'mcq', 'practice']):
            return self.generate_quiz(query)
        elif any(word in query_lower for word in ['profile', 'navigation', 'where', 'find']):
            return self.get_navigation_help(query)
        elif any(word in query_lower for word in ['notes', 'pdf', 'material', 'download']):
            return self.get_study_materials()
        elif any(word in query_lower for word in ['help', 'support', 'human']):
            return self.get_human_help()
        elif any(word in query_lower for word in ['score', 'marks', 'result', 'report']):
            return self.get_performance_data()
        elif any(word in query_lower for word in ['course', 'enrolled']):
            return self.get_course_data()
        else:
            return self.get_general_data()
    
    def get_attendance_data(self):
        total_days = Attendance.objects.filter(student=self.student).count()
        present_days = Attendance.objects.filter(student=self.student, is_present=True).count()
        percentage = (present_days / total_days * 100) if total_days > 0 else 0
        
        return {
            'type': 'attendance',
            'total_days': total_days,
            'present_days': present_days,
            'percentage': round(percentage, 1),
            'message': f"Your attendance: {present_days}/{total_days} days ({percentage:.1f}%)"
        }
    
    def get_fee_data(self):
        try:
            student_fee = StudentFee.objects.get(student=self.student)
            return {
                'type': 'fees',
                'total_amount': float(student_fee.total_amount),
                'paid_amount': float(student_fee.amount_paid),
                'status': student_fee.status,
                'message': f"Fee Status: {student_fee.status.title()} - Paid: ₹{student_fee.amount_paid}/₹{student_fee.total_amount}"
            }
        except StudentFee.DoesNotExist:
            return {'type': 'fees', 'message': 'No fee information available'}
    
    def get_schedule_data(self):
        return {
            'type': 'schedule',
            'message': f"Today's schedule for {self.student.course.title if self.student.course else 'your course'}"
        }
    
    def get_course_data(self):
        return {
            'type': 'course',
            'course': self.student.course.title if self.student.course else 'No course assigned',
            'batch': self.student.batch.name if self.student.batch else 'No batch assigned'
        }
    
    def get_certificate_data(self):
        return {
            'type': 'certificate',
            'message': f'You can download your certificates from the Documents section. Visit: /student/documents',
            'download_link': '/student/documents'
        }
    
    def get_assignment_data(self):
        try:
            projects = Project.objects.filter(batch=self.student.batch, status='active')
            pending = projects.exclude(submissions__student=self.student)
            return {
                'type': 'assignments',
                'total_projects': projects.count(),
                'pending_count': pending.count(),
                'message': f'You have {pending.count()} pending assignments out of {projects.count()} total projects.'
            }
        except:
            return {'type': 'assignments', 'message': 'No assignment information available.'}
    
    def get_exam_data(self):
        # Mock exam data - replace with actual exam model
        next_exam_date = date.today() + timedelta(days=15)
        days_left = (next_exam_date - date.today()).days
        return {
            'type': 'exam',
            'next_exam': next_exam_date.strftime('%B %d, %Y'),
            'days_left': days_left,
            'message': f'Your next exam is on {next_exam_date.strftime("%B %d, %Y")} - {days_left} days left!'
        }
    
    def generate_quiz(self, query):
        # Extract topic from query or use default
        topic = 'Python' if 'python' in query.lower() else 'General Programming'
        
        quiz_questions = {
            'Python': [
                {'q': 'What is a Python list?', 'options': ['Array', 'Ordered collection', 'Function', 'Class'], 'correct': 1},
                {'q': 'Which keyword is used for loops?', 'options': ['loop', 'for', 'repeat', 'iterate'], 'correct': 1},
                {'q': 'Python is interpreted or compiled?', 'options': ['Compiled', 'Interpreted', 'Both', 'Neither'], 'correct': 1},
                {'q': 'What does len() function do?', 'options': ['Length', 'List', 'Loop', 'Load'], 'correct': 0},
                {'q': 'Python file extension?', 'options': ['.py', '.python', '.pt', '.pyt'], 'correct': 0}
            ]
        }
        
        questions = quiz_questions.get(topic, quiz_questions['Python'])
        selected = random.sample(questions, min(5, len(questions)))
        
        return {
            'type': 'quiz',
            'topic': topic,
            'questions': selected,
            'message': f'Here\'s a 5-question quiz on {topic}:'
        }
    
    def get_navigation_help(self, query):
        navigation_map = {
            'profile': '/student/profile - Your personal information and settings',
            'attendance': '/student/attendance - View your attendance records',
            'fees': '/student/fee-management - Check fee status and make payments',
            'courses': '/student/courses - Access your enrolled courses',
            'documents': '/student/documents - Download certificates and documents',
            'performance': '/student/performance - View grades and progress'
        }
        
        for key, value in navigation_map.items():
            if key in query.lower():
                return {'type': 'navigation', 'message': f'You can find your {key} at: {value}'}
        
        return {
            'type': 'navigation',
            'message': 'Available sections: Profile, Attendance, Fees, Courses, Documents, Performance. What are you looking for?'
        }
    
    def get_study_materials(self):
        return {
            'type': 'materials',
            'message': 'Study materials are available in your course section. Visit /student/courses to access notes, PDFs, and videos.',
            'link': '/student/courses'
        }
    
    def get_human_help(self):
        return {
            'type': 'support',
            'message': 'I\'ll connect you with our support team. You can also email us at support@miracleacademy.com or call +91-XXXXXXXXX',
            'contact': 'support@miracleacademy.com'
        }
    
    def get_performance_data(self):
        try:
            submissions = ProjectSubmission.objects.filter(student=self.student).order_by('-submission_date')[:3]
            if submissions:
                scores = [sub.grade for sub in submissions if sub.grade]
                avg_score = sum(scores) / len(scores) if scores else 0
                return {
                    'type': 'performance',
                    'recent_scores': scores,
                    'average': round(avg_score, 1),
                    'message': f'Your last 3 scores: {scores}. Average: {avg_score:.1f}%'
                }
        except:
            pass
        return {'type': 'performance', 'message': 'No recent performance data available.'}
    
    def get_general_data(self):
        return {
            'type': 'general',
            'student_name': self.student.user.first_name,
            'enrollment_id': self.student.enrollment_id,
            'course': self.student.course.title if self.student.course else None
        }