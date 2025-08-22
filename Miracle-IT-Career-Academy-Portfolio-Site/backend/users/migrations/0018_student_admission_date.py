from django.db import migrations, models
import datetime

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0017_attendance'),
    ]

    operations = [
        migrations.AddField(
            model_name='student',
            name='admission_date',
            field=models.DateField(default=datetime.date.today),
        ),
    ]