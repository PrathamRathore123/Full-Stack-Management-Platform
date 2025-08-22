from django.contrib import admin
from .models import CustomUser, Student, Faculty, Admin, Workshop, Certificate, Batch, Attendance, Holiday, Project, ProjectSubmission, FeeStructure

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role')
    search_fields = ('username', 'email')
    list_filter = ('role',)

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('user', 'enrollment_id', 'date_of_birth', 'admission_date', 'batch')
    search_fields = ('user__username', 'enrollment_id')
    list_filter = ('batch', 'admission_date')
    raw_id_fields = ('user',)
    fields = ('user', 'enrollment_id', 'date_of_birth', 'admission_date', 'batch', 'course')

@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ('user', 'department')
    search_fields = ('user__username', 'department')

@admin.register(Admin)
class AdminAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_super_admin')
    search_fields = ('user__username',)

@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'location', 'available_seats')
    search_fields = ('title', 'description')

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('title', 'level', 'duration')
    search_fields = ('title', 'description')

@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
    
@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'date', 'is_present')
    search_fields = ('student__user__username', 'date')
    raw_id_fields = ('student',)
    list_filter = ('is_present', 'date')

@admin.register(Holiday)
class HolidayAdmin(admin.ModelAdmin):
    list_display = ('date', 'name', 'is_government')
    search_fields = ('name', 'date')
    list_filter = ('is_government',)
    
# @admin.register(Project)
# class ProjectAdmin(admin.ModelAdmin):
#     list_display = ('title', 'description', 'student', 'faculty', 'status')
#     search_fields = ('title', 'description', 'student__user__username', 'faculty__user__username')
#     raw_id_fields = ('student', 'faculty')
#     list_filter = ('status',)

@admin.register(FeeStructure)
class FeeStructureAdmin(admin.ModelAdmin):
    list_display = ('name', 'course', 'total_amount', 'installments')
    search_fields = ('name', 'course__title')