from django.db import models
from users.models import Student

class ChatConversation(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='chat_conversations')
    message = models.TextField()
    response = models.TextField()
    intent = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']