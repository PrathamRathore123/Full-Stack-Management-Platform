from django.core.management.base import BaseCommand
from backend.users.models import CustomUser, Student, StudentFee, FeeStructure
from django.db import transaction

class Command(BaseCommand):
    help = 'Fix missing user-student_profile, course, StudentFee linkage and create default StudentFee if missing'

    def handle(self, *args, **options):
        self.stdout.write("Starting to fix student fee linkage...")

        users = CustomUser.objects.filter(role='student')
        fixed_count = 0
        created_fee_count = 0

        for user in users:
            try:
                student = getattr(user, 'student_profile', None)
                if not student:
                    self.stdout.write(f"User {user.username} has no student_profile. Skipping.")
                    continue

                if not student.course:
                    self.stdout.write(f"Student {student.enrollment_id} has no course assigned. Skipping.")
                    continue

                # Check if StudentFee exists for this student and course fee structure
                fee_struct = FeeStructure.objects.filter(course=student.course).first()
                if not fee_struct:
                    self.stdout.write(f"No FeeStructure found for course {student.course.title} for student {student.enrollment_id}. Skipping.")
                    continue

                student_fees = StudentFee.objects.filter(student=student, fee_structure=fee_struct)
                if not student_fees.exists():
                    # Create default StudentFee
                    with transaction.atomic():
                        StudentFee.objects.create(
                            student=student,
                            fee_structure=fee_struct,
                            total_amount=fee_struct.total_amount,
                            amount_paid=0
                        )
                    created_fee_count += 1
                    self.stdout.write(f"Created StudentFee for student {student.enrollment_id} with course {student.course.title}.")
                else:
                    fixed_count += 1

            except Exception as e:
                self.stdout.write(f"Error processing user {user.username}: {str(e)}")

        self.stdout.write(f"Finished fixing student fee linkage. Existing fees found: {fixed_count}, Fees created: {created_fee_count}")
