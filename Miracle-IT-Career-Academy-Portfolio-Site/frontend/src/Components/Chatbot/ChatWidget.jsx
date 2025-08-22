import React, { useState, useRef, useEffect } from 'react';
import './ChatWidget.css';
import { chatAPI } from '../../api';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickActions, setQuickActions] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [language, setLanguage] = useState('en');
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    fetchQuickActions();
    initializeSpeechRecognition();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      setShowQuickActions(false);
    }
  }, [messages]);

  const fetchQuickActions = async () => {
    try {
      const response = await chatAPI.getQuickActions();
      setQuickActions(response.data.actions);
    } catch (error) {
      console.error('Error fetching quick actions:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = { text: message, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setShowQuickActions(false);

    try {
      const response = await chatAPI.sendMessage(message);
      const botMessage = {
        text: response.data.response || 'I received your message but couldn\'t generate a response.',
        sender: 'bot',
        timestamp: new Date(),
        data: response.data.data
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Auto-speak response if voice was used
      if (isListening) {
        speakResponse(botMessage.text);
      }
    } catch (error) {
      console.error('Chat error:', error);
      let errorText = 'I\'m having trouble right now. Please try again in a moment.';
      
      if (error.response?.status === 404) {
        errorText = 'Please make sure you are logged in as a student.';
      } else if (error.response?.status === 401) {
        errorText = 'Your session has expired. Please log in again.';
      } else if (!navigator.onLine) {
        errorText = 'Please check your internet connection and try again.';
      }
      
      const errorMessage = {
        text: errorText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        sendMessage(transcript);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleQuickAction = (action) => {
    sendMessage(action.query);
  };

  const renderQuizQuestions = (data) => {
    if (data.type === 'quiz' && data.questions) {
      return (
        <div className="quiz-container">
          <h4>🧠 {data.topic} Quiz</h4>
          {data.questions.map((q, index) => (
            <div key={index} className="quiz-question">
              <p><strong>Q{index + 1}:</strong> {q.q}</p>
              <div className="quiz-options">
                {q.options.map((option, optIndex) => (
                  <div key={optIndex} className="quiz-option">
                    {String.fromCharCode(65 + optIndex)}. {option}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderSpecialContent = (message) => {
    if (message.data?.type === 'quiz') {
      return renderQuizQuestions(message.data);
    }
    if (message.data?.download_link) {
      return (
        <div className="action-link">
          <a href={message.data.download_link} target="_blank" rel="noopener noreferrer">
            📥 Access Here
          </a>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chat-widget">
      {!isOpen && (
        <div className="chat-toggle" onClick={() => setIsOpen(true)}>
          <div className="bot-avatar">
            <span>🤖</span>
          </div>
          {messages.length > 0 && (
            <div className="notification-badge">{messages.length}</div>
          )}
        </div>
      )}

      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <div className="bot-info">
              <div className="bot-avatar small">🤖</div>
              <div className="bot-status">
                <span>AI Study Assistant</span>
                <div className="status-indicator">
                  <div className="status-dot"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="welcome-message">
                <div className="bot-intro">
                  <div className="bot-avatar-large">🤖</div>
                  <h3>Hi! I'm your AI Study Assistant</h3>
                  <p>I can help you with attendance, fees, assignments, quizzes, and more!</p>
                  <div className="feature-badges">
                    <span className="badge">🎤 Voice</span>
                    <span className="badge">🌐 Hindi</span>
                    <span className="badge">🧠 Smart</span>
                  </div>
                </div>
                
                {showQuickActions && (
                  <div className="quick-actions">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        className="quick-action-btn"
                        onClick={() => handleQuickAction(action)}
                      >
                        <span className="action-icon">{action.icon}</span>
                        {action.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                <div className="message-content">
                  {message.text}
                  {renderSpecialContent(message)}
                </div>
                <div className="message-actions">
                  {message.sender === 'bot' && (
                    <button 
                      className="speak-btn" 
                      onClick={() => speakResponse(message.text)}
                      title="Listen to response"
                    >
                      🔊
                    </button>
                  )}
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message bot typing">
                <div className="typing-container">
                  <div className="typing-avatar">🤖</div>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <div className="input-controls">
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="language-selector"
                title="Select Language"
              >
                <option value="en">🇺🇸 EN</option>
                <option value="hi">🇮🇳 हिं</option>
              </select>
              
              <button 
                className={`voice-btn ${isListening ? 'listening' : ''}`}
                onClick={toggleVoiceInput}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? (
                  <div className="listening-animation">
                    <span>🎙️</span>
                    <div className="sound-waves">
                      <div className="wave"></div>
                      <div className="wave"></div>
                      <div className="wave"></div>
                    </div>
                  </div>
                ) : (
                  '🎤'
                )}
              </button>
            </div>
            
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
              placeholder={language === 'hi' ? 'मुझसे कुछ भी पूछें...' : 'Ask me anything...'}
            />
            
            <button 
              onClick={() => sendMessage(inputMessage)}
              disabled={!inputMessage.trim()}
              className="send-btn"
            >
              <span>Send</span>
              <div className="send-icon">✈️</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;