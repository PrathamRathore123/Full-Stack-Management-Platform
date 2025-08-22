from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from . import views

def home(request):
    return JsonResponse({'message': 'Miracle IT Career Academy API is running'})

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/chatbot/', include('chatbot.urls')),
    path('create-order/', views.create_order),
    path('verify-payment/', views.verify_payment),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)