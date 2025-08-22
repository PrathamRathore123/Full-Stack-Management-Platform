from django.contrib import admin
from .models import Course, Video, Quiz, CourseSyllabus, SyllabusItem, CourseEnrollment, Notification, CourseEnquiry, Payment

class VideoInline(admin.TabularInline):
    model = Video
    extra = 1

class SyllabusItemInline(admin.TabularInline):
    model = SyllabusItem
    extra = 1

class CourseSyllabusInline(admin.TabularInline):
    model = CourseSyllabus
    extra = 1

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'level', 'duration', 'price', 'is_certified', 'created_at')
    search_fields = ('title', 'description')
    list_filter = ('level', 'is_certified')
    inlines = [CourseSyllabusInline, VideoInline]
    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'image')
        }),
        ('Course Details', {
            'fields': ('duration', 'level', 'internship_duration', 'is_certified')
        }),
        ('Pricing', {
            'fields': ('price', 'discount_price')
        }),
        ('YouTube Integration', {
            'fields': ('youtube_playlist_id',)
        }),
    )

@admin.register(CourseSyllabus)
class CourseSyllabusAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    search_fields = ('title', 'course__title')
    list_filter = ('course',)
    inlines = [SyllabusItemInline]

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'source_type', 'order')
    search_fields = ('title', 'course__title')
    list_filter = ('course', 'source_type')

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'questions', 'time', 'difficulty')
    search_fields = ('title', 'description')
    list_filter = ('difficulty',)

@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'enrolled_date')
    search_fields = ('user__username', 'user__email', 'course__title')
    list_filter = ('course', 'enrolled_date')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'created_at', 'is_read')
    search_fields = ('user__username', 'title', 'message')
    list_filter = ('is_read', 'created_at')

@admin.register(CourseEnquiry)
class CourseEnquiryAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'course', 'status', 'created_at')
    search_fields = ('name', 'email', 'phone', 'course__title')
    list_filter = ('status', 'course', 'created_at')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'amount', 'status', 'created_at')
    search_fields = ('user__username', 'user__email', 'course__title', 'payment_id')
    list_filter = ('status', 'course', 'created_at')