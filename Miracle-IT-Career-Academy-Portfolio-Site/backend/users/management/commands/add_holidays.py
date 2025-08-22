from django.core.management.base import BaseCommand
from users.models import Holiday
from datetime import datetime

class Command(BaseCommand):
    help = 'Add government holidays for 2024'

    def handle(self, *args, **options):
        # List of Indian government holidays for 2024
        holidays = [
            ('2024-01-01', 'New Year\'s Day'),
            ('2024-01-26', 'Republic Day'),
            ('2024-03-08', 'Maha Shivaratri'),
            ('2024-03-25', 'Holi'),
            ('2024-03-29', 'Good Friday'),
            ('2024-04-09', 'Ugadi'),
            ('2024-04-11', 'Eid al-Fitr'),
            ('2024-04-17', 'Ram Navami'),
            ('2024-05-01', 'Labor Day'),
            ('2024-06-17', 'Eid al-Adha'),
            ('2024-08-15', 'Independence Day'),
            ('2024-08-26', 'Janmashtami'),
            ('2024-10-02', 'Gandhi Jayanti'),
            ('2024-10-31', 'Diwali'),
            ('2024-11-01', 'Govardhan Puja'),
            ('2024-12-25', 'Christmas')
        ]
        
        count = 0
        for holiday_date, name in holidays:
            date_obj = datetime.strptime(holiday_date, '%Y-%m-%d').date()
            holiday, created = Holiday.objects.get_or_create(
                date=date_obj,
                defaults={'name': name, 'is_government': True}
            )
            if created:
                count += 1
                self.stdout.write(self.style.SUCCESS(f'Added holiday: {name} on {holiday_date}'))
            else:
                self.stdout.write(f'Holiday already exists: {name} on {holiday_date}')
                
        self.stdout.write(self.style.SUCCESS(f'Successfully added {count} holidays'))