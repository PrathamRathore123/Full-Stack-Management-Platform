import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import Group

# Check if faculty group exists
faculty_exists = Group.objects.filter(name='faculty').exists()
print(f"Faculty group exists: {faculty_exists}")

# Create faculty group if it doesn't exist
if not faculty_exists:
    Group.objects.create(name='faculty')
    print("Faculty group created")