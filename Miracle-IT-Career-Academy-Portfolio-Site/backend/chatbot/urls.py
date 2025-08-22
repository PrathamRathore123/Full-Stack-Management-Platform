from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.chat_message, name='chat_message'),
    path('quick-actions/', views.quick_actions, name='quick_actions'),
    path('voice-chat/', views.voice_chat, name='voice_chat'),
]