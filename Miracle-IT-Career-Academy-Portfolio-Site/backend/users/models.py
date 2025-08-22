from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import date
from django.db.models.signals import post_save
from django.dispatch import receiver

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('faculty', 'Faculty'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

class Batch(models.Model):
    name = models.CharField(max_length=100)
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='batches', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.course.title if self.course else 'No Course'}"

class Student(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='student_profile')
    enrollment_id = models.CharField(max_length=20, unique=True)
    date_of_birth = models.DateField(null=True, blank=True)
    admission_date = models.DateField(default=date.today)
    course = models.ForeignKey('courses.Course', on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    batch = models.ForeignKey(Batch, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    created_at = models.DateTimeField(default=timezone.now)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='created_students')

    def __str__(self):
        return f"{self.user.username} - {self.enrollment_id}"

class Faculty(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='faculty_profile')
    department = models.CharField(max_length=100, blank=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='created_faculty')

class Admin(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='admin_profile')
    is_super_admin = models.BooleanField(default=False)

class Workshop(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='workshop_images/', null=True, blank=True)
    date = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    available_seats = models.IntegerField(default=0)
    category = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.title

class WorkshopRegistration(models.Model):
    EXPERIENCE_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    )

    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, related_name='registrations')
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    education = models.CharField(max_length=200, blank=True, null=True)
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES, default='beginner')
    special_requirements = models.TextField(blank=True, null=True)
    registration_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.workshop.title}"

class Certificate(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.URLField()
    duration = models.CharField(max_length=50)
    level = models.CharField(max_length=50)

    def __str__(self):
        return self.title

class Holiday(models.Model):
    date = models.DateField(unique=True)
    name = models.CharField(max_length=100)
    is_government = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} - {self.date}"

class Attendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(default=date.today)
    is_present = models.BooleanField(default=True)
    login_time = models.DateTimeField(auto_now_add=True)
    remarks = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ['student', 'date']
        
    def __str__(self):
        return f"{self.student.user.username} - {self.date} - {'Present' if self.is_present else 'Absent'}"

class Project(models.Model):
    DIFFICULTY_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    )
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('archived', 'Archived'),
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    technologies = models.JSONField(default=list)
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='projects')
    batch_name = models.CharField(max_length=100, blank=True)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='intermediate')
    deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='created_projects')
    
    def save(self, *args, **kwargs):
        if self.batch and not self.batch_name:
            self.batch_name = self.batch.name
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.title} - {self.batch_name}"

class ProjectSubmission(models.Model):
    STATUS_CHOICES = (
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='project_submissions')
    repository_url = models.URLField()
    live_url = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    grade = models.IntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True, null=True)
    submission_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.student.enrollment_id} - {self.project.title}"

class StudentAchievement(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='achievements')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.student.enrollment_id} - {self.name}"

# Fee Management System Models
class FeeStructure(models.Model):
    name = models.CharField(max_length=100)
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='fee_structures')
    registration_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tuition_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    installments = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='created_fee_structures')

    def __str__(self):
        return f"{self.name} - {self.course.title}"

class FeeInstallment(models.Model):
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.CASCADE, related_name='installments_list')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    sequence = models.IntegerField(default=1)
    
    def __str__(self):
        return f"{self.fee_structure.name} - Installment {self.sequence}"
    
    class Meta:
        ordering = ['sequence']

class StudentFee(models.Model):
    STATUS_CHOICES = (
        ('paid', 'Paid'),
        ('unpaid', 'Unpaid'),
        ('partially_paid', 'Partially Paid'),
    )
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='fees')
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.CASCADE, related_name='student_fees')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unpaid')
    assigned_date = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='assigned_fees')
    
    def __str__(self):
        return f"{self.student.user.username} - {self.fee_structure.name}"
    
    def save(self, *args, **kwargs):
        if self.amount_paid >= self.total_amount:
            self.status = 'paid'
        elif self.amount_paid > 0:
            self.status = 'partially_paid'
        else:
            self.status = 'unpaid'
        super().save(*args, **kwargs)

class FeePayment(models.Model):
    PAYMENT_MODE_CHOICES = (
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
        ('online', 'Online Payment'),
        ('check', 'Check'),
    )
    
    PAYMENT_STATUS_CHOICES = (
        ('success', 'Success'),
        ('pending', 'Pending'),
        ('failed', 'Failed'),
    )
    
    student_fee = models.ForeignKey(StudentFee, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(default=timezone.now)
    payment_mode = models.CharField(max_length=20, choices=PAYMENT_MODE_CHOICES)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    receipt_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='success')
    remarks = models.TextField(blank=True, null=True)
    recorded_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='recorded_payments')
    
    def __str__(self):
        return f"{self.receipt_number} - {self.student_fee.student.user.username}"

class FeeDiscount(models.Model):
    DISCOUNT_TYPE_CHOICES = (
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    )
    
    student_fee = models.ForeignKey(StudentFee, on_delete=models.CASCADE, related_name='discounts')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES)
    reason = models.CharField(max_length=200)
    applied_date = models.DateTimeField(auto_now_add=True)
    applied_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='applied_discounts')
    
    def __str__(self):
        return f"{self.student_fee.student.user.username} - {self.amount} {self.get_discount_type_display()}"

class FeeFine(models.Model):
    student_fee = models.ForeignKey(StudentFee, on_delete=models.CASCADE, related_name='fines')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.CharField(max_length=200)
    due_date = models.DateField()
    is_paid = models.BooleanField(default=False)
    applied_date = models.DateTimeField(auto_now_add=True)
    applied_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='applied_fines')
    
    def __str__(self):
        return f"{self.student_fee.student.user.username} - {self.amount}"

class AdminNotification(models.Model):
    NOTIFICATION_TYPES = (
        ('payment', 'Payment Received'),
        ('enrollment', 'New Enrollment'),
        ('system', 'System Alert'),
        ('fee_due', 'Fee Due Alert'),
    )
    
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"

@receiver(post_save, sender=FeePayment)
def update_student_fee_after_payment(sender, instance, created, **kwargs):
    if created and instance.status == 'success':
        student_fee = instance.student_fee
        student_fee.amount_paid += instance.amount
        student_fee.save()
        
        # Create admin notification (only if table exists)
        try:
            AdminNotification.objects.create(
                title=f"Payment Received - {instance.student_fee.student.user.username}",
                message=f"Student {instance.student_fee.student.user.username} (ID: {instance.student_fee.student.enrollment_id}) has paid ₹{instance.amount} on {instance.payment_date.strftime('%d/%m/%Y at %H:%M')}. Receipt: {instance.receipt_number}",
                notification_type='payment',
                student=instance.student_fee.student,
                amount=instance.amount
            )
        except Exception as e:
            # Table doesn't exist yet, skip notification creation
            pass