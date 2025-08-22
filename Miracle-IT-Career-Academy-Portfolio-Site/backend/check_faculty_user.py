import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import Group
from users.models import CustomUser, Faculty

# Get the faculty group
faculty_group = Group.objects.get(name='faculty')

# Check if any faculty users exist
faculty_users = Faculty.objects.all()
print(f"Number of faculty users: {faculty_users.count()}")

# Print faculty users and their group memberships
for faculty in faculty_users:
    user = faculty.user
    print(f"Faculty: {user.username}")
    print(f"Groups: {', '.join([g.name for g in user.groups.all()])}")
    print(f"Is in faculty group: {user.groups.filter(name='faculty').exists()}")
    
    # Add user to faculty group if not already a member
    if not user.groups.filter(name='faculty').exists():
        user.groups.add(faculty_group)
        user.save()
        print(f"Added {user.username} to faculty group")