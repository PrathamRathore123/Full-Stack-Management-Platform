import google.generativeai as genai
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-pro')
            self.is_configured = True
        except Exception as e:
            logger.error(f"Failed to configure Gemini AI: {e}")
            self.is_configured = False
    
    def generate_response(self, query, student_data):
        if not self.is_configured:
            return self._generate_fallback_response(query, student_data)
        
        # Detect language
        is_hindi = any(char in query for char in 'अआइईउऊएऐओऔकखगघचछजझटठडढतथदधनपफबभमयरलवशषसह')
        
        prompt = f"""
You are a friendly student assistant for Miracle Academy. Answer based on the student's data.

Student Query: {query}
Student Data: {student_data}

Guidelines:
- Keep responses short, friendly, and actionable
- If asked about attendance, fees, or grades, use the exact data provided
- For study topics, give brief explanations with examples
- For navigation help, provide clear directions
- If generating quiz, format questions clearly
- Support both English and Hindi responses
- End with a helpful suggestion when appropriate

{'Respond in Hindi if the query is in Hindi, otherwise respond in English.' if is_hindi else 'Respond in English.'}
"""
        try:
            response = self.model.generate_content(prompt)
            if response and response.text:
                return response.text
            else:
                return self._generate_fallback_response(query, student_data)
        except Exception as e:
            logger.error(f"Gemini AI error: {e}")
            return self._generate_fallback_response(query, student_data)
    
    def _generate_fallback_response(self, query, student_data):
        """Generate response without AI when Gemini is unavailable"""
        query_lower = query.lower()
        
        if 'attendance' in query_lower:
            if student_data.get('type') == 'attendance':
                return student_data.get('message', 'No attendance data available.')
            return 'I can help you check your attendance. Let me get that information for you.'
        
        elif any(word in query_lower for word in ['fee', 'payment', 'paid']):
            if student_data.get('type') == 'fees':
                return student_data.get('message', 'No fee information available.')
            return 'I can help you check your fee status. Let me get that information for you.'
        
        elif any(word in query_lower for word in ['schedule', 'class', 'today']):
            if student_data.get('type') == 'schedule':
                return student_data.get('message', 'No schedule information available.')
            return 'I can help you check your schedule. Let me get that information for you.'
        
        elif 'certificate' in query_lower:
            return student_data.get('message', 'You can download certificates from the Documents section.')
        
        elif 'assignment' in query_lower:
            return student_data.get('message', 'Check your assignments in the Projects section.')
        
        elif 'exam' in query_lower:
            return student_data.get('message', 'No upcoming exams scheduled.')
        
        elif 'quiz' in query_lower:
            if student_data.get('type') == 'quiz':
                questions = student_data.get('questions', [])
                if questions:
                    quiz_text = f"Quiz on {student_data.get('topic', 'General')}:\n\n"
                    for i, q in enumerate(questions, 1):
                        quiz_text += f"{i}. {q['q']}\n"
                        for j, opt in enumerate(q['options']):
                            quiz_text += f"   {chr(65+j)}. {opt}\n"
                        quiz_text += "\n"
                    return quiz_text
            return 'I can generate practice quizzes for you. What topic would you like to practice?'
        
        elif 'course' in query_lower:
            if student_data.get('type') == 'course':
                course = student_data.get('course', 'No course assigned')
                batch = student_data.get('batch', 'No batch assigned')
                return f"You are enrolled in: {course}. Your batch is: {batch}."
            return 'I can help you check your course information.'
        
        else:
            return 'I can help you with: attendance, fees, schedule, assignments, exams, quizzes, certificates, navigation, and study materials. What would you like to know?'