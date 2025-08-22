from django.core.management.base import BaseCommand
from users.models import CustomUser, Admin
from django.db import transaction

class Command(BaseCommand):
    help = 'Creates an admin user'

    def add_arguments(self, parser):
        parser.add_argument('--username', required=True, help='Admin username')
        parser.add_argument('--email', required=True, help='Admin email')
        parser.add_argument('--password', required=True, help='Admin password')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        
        # Check if admin already exists
        if Admin.objects.exists():
            self.stdout.write(self.style.ERROR('Admin already exists. Only one admin can be created.'))
            return
        
        try:
            with transaction.atomic():
                # Create user with admin role
                user = CustomUser.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    role='admin'
                )
                
                # Create admin profile
                Admin.objects.create(
                    user=user,
                    is_super_admin=True
                )
                
                self.stdout.write(self.style.SUCCESS(f'Admin user "{username}" created successfully'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to create admin: {str(e)}'))