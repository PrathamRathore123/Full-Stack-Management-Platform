from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

User = get_user_model()

class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='course_images/')
    duration = models.CharField(max_length=50)
    level = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    internship_duration = models.CharField(max_length=50, blank=True, null=True)
    is_certified = models.BooleanField(default=False)
    last_updated = models.DateTimeField(auto_now=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    youtube_playlist_id = models.CharField(max_length=100, blank=True, null=True, help_text="YouTube playlist ID")
    preview_video_url = models.URLField(blank=True, null=True, help_text="URL for the preview video (first video of playlist)")
    preview_duration = models.IntegerField(default=300, help_text="Preview duration in seconds (default: 5 minutes)")
    
    def __str__(self):
        return self.title
    
    def get_first_video_as_preview(self):
        """Get the first video of the course as preview"""
        first_video = self.videos.filter(order=0).first()
        if first_video:
            return {
                'id': 'preview',
                'title': f'{self.title} - Preview',
                'url': first_video.url,
                'source_type': first_video.source_type,
                'order': -1,
                'preview_duration': self.preview_duration
            }
        return None

class CourseSyllabus(models.Model):
    course = models.ForeignKey(Course, related_name='syllabus_modules', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    order = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.course.title} - Module {self.order}: {self.title}"
    
    class Meta:
        ordering = ['order']

class SyllabusItem(models.Model):
    module = models.ForeignKey(CourseSyllabus, related_name='items', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    order = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.module.title} - {self.title}"
    
    class Meta:
        ordering = ['order']

class Video(models.Model):
    VIDEO_SOURCE_CHOICES = (
        ('url', 'Direct URL'),
        ('youtube', 'YouTube Video'),
    )
    
    course = models.ForeignKey(Course, related_name='videos', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    url = models.URLField()
    video_id = models.CharField(max_length=50, blank=True, null=True, help_text="YouTube video ID")
    source_type = models.CharField(max_length=10, choices=VIDEO_SOURCE_CHOICES, default='url')
    order = models.IntegerField(default=0)
    preview_duration = models.IntegerField(default=180, help_text="Preview duration in seconds (default: 3 minutes)")
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"
    
    class Meta:
        ordering = ['order']

class Quiz(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='quiz_images/', blank=True, null=True)
    questions = models.IntegerField(default=0)
    time = models.CharField(max_length=50)
    difficulty = models.CharField(max_length=50)
    
    def __str__(self):
        return self.title

class CourseEnrollment(models.Model):
    user = models.ForeignKey(User, related_name='enrollments', on_delete=models.CASCADE)
    course = models.ForeignKey(Course, related_name='enrollments', on_delete=models.CASCADE)
    enrolled_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'course']
    
    def __str__(self):
        return f"{self.user.username} - {self.course.title}"

class Notification(models.Model):
    user = models.ForeignKey(User, related_name='notifications', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"
    
    class Meta:
        ordering = ['-created_at']
        
class CourseEnquiry(models.Model):
    ENQUIRY_STATUS = (
        ('pending', 'Pending'),
        ('contacted', 'Contacted'),
        ('enrolled', 'Enrolled'),
        ('rejected', 'Rejected')
    )
    
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    course = models.ForeignKey(Course, related_name='enquiries', on_delete=models.CASCADE)
    message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=ENQUIRY_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, related_name='enquiries', on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"{self.name} - {self.course.title}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Course Enquiries'

class Payment(models.Model):
    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded')
    )
    
    user = models.ForeignKey(User, related_name='payments', on_delete=models.CASCADE)
    course = models.ForeignKey(Course, related_name='payments', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_id = models.CharField(max_length=100, blank=True, null=True)
    order_id = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.course.title} - {self.amount}"
    
    class Meta:
        ordering = ['-created_at']

@receiver(post_save, sender=CourseSyllabus)
def notify_syllabus_update(sender, instance, **kwargs):
    course = instance.course
    enrollments = CourseEnrollment.objects.filter(course=course)
    
    # Create notification for all enrolled students
    for enrollment in enrollments:
        if kwargs.get('created'):
            title = f"New Module Added to {course.title}"
            message = f"A new module '{instance.title}' has been added to {course.title}."
        else:
            title = f"Course Syllabus Updated"
            message = f"The syllabus for {course.title} has been updated. Module: {instance.title}"
        
        Notification.objects.create(
            user=enrollment.user,
            title=title,
            message=message
        )

@receiver(post_save, sender=SyllabusItem)
def notify_syllabus_item_update(sender, instance, **kwargs):
    module = instance.module
    course = module.course
    enrollments = CourseEnrollment.objects.filter(course=course)
    
    # Create notification for all enrolled students
    for enrollment in enrollments:
        if kwargs.get('created'):
            title = f"New Content Added to {course.title}"
            message = f"New content '{instance.title}' has been added to module '{module.title}' in {course.title}."
        else:
            title = f"Course Content Updated"
            message = f"The content for {course.title} has been updated in module: {module.title}"
        
        Notification.objects.create(
            user=enrollment.user,
            title=title,
            message=message
        )