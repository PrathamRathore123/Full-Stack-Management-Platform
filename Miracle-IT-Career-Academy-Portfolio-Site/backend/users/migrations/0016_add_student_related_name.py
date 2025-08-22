# backend/users/migrations/0016_add_student_related_name.py
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0015_remove_student_updated_at_student_created_by_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='student',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='student_profile', to='users.customuser'),
        ),
    ]
