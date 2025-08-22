from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from users.models import Student
from .models import ChatConversation
from .gemini_service import GeminiService
from .intent_processor import IntentProcessor
import json
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_message(request):
    try:
        student = Student.objects.get(user=request.user)
        message = request.data.get('message', '').strip()
        
        if not message:
            return Response({
                'response': 'Please ask me something! I can help with your attendance, fees, schedule, or courses.',
                'data': {'type': 'general'}
            })
        
        # Process intent and get student data
        processor = IntentProcessor(student)
        student_data = processor.process_query(message)
        
        # Generate AI response
        gemini_service = GeminiService()
        ai_response = gemini_service.generate_response(message, student_data)
        
        # Save conversation
        try:
            ChatConversation.objects.create(
                student=student,
                message=message,
                response=ai_response,
                intent=student_data.get('type', 'general')
            )
        except Exception as save_error:
            logger.error(f"Failed to save conversation: {save_error}")
            # Continue without saving if database error
        
        return Response({
            'response': ai_response,
            'data': student_data
        })
        
    except Student.DoesNotExist:
        return Response({
            'response': 'I can only help students. Please make sure you are logged in with a student account.',
            'data': {'type': 'error'}
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return Response({
            'response': 'I encountered an error. Please try asking your question again.',
            'data': {'type': 'error'}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quick_actions(request):
    return Response({
        'actions': [
            {'text': 'My Attendance', 'query': 'What is my attendance?', 'icon': '📊'},
            {'text': 'Fee Status', 'query': 'Have I paid my fees?', 'icon': '💰'},
            {'text': 'Next Exam', 'query': 'When is my next exam?', 'icon': '📝'},
            {'text': 'Download Certificate', 'query': 'How to download my certificate?', 'icon': '🎓'},
            {'text': 'My Assignments', 'query': 'Show my pending assignments', 'icon': '📋'},
            {'text': 'Practice Quiz', 'query': 'Generate a Python quiz for me', 'icon': '🧠'},
            {'text': 'Study Materials', 'query': 'Where can I find study materials?', 'icon': '📚'},
            {'text': 'Need Help', 'query': 'I need human support', 'icon': '🆘'}
        ]
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def voice_chat(request):
    """Handle voice input for chat"""
    try:
        audio_text = request.data.get('text', '')
        if not audio_text:
            return Response({'error': 'No text provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Process same as regular chat
        student = Student.objects.get(user=request.user)
        processor = IntentProcessor(student)
        student_data = processor.process_query(audio_text)
        
        gemini_service = GeminiService()
        ai_response = gemini_service.generate_response(audio_text, student_data)
        
        return Response({
            'response': ai_response,
            'data': student_data,
            'voice_enabled': True
        })
        
    except Student.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Voice chat error: {e}")
        return Response({'error': 'Voice processing failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)