import React, { useEffect } from 'react';
import './Homefive.css';
import { FaCheck } from 'react-icons/fa';

export default function Homefive() {
  useEffect(() => {
    // Initialize the message animation
    const startMessageAnimation = () => {
      if (window.messageAnimationRunning) return;
      window.messageAnimationRunning = true;

      const messages = [
        { type: 'ai', text: "Hello! I'm your AI Study Assistant." },
        { type: 'ai', text: "How can I help with your studies today?" },
        { type: 'user', text: "Can you analyze my recent test scores?" },
        { type: 'ai', text: "I've analyzed your performance. Your strengths are in mathematics and science, but I notice you might need some help with literature." },
        { type: 'user', text: "What resources do you recommend for improving my literature scores?" },
        { type: 'ai', text: "Based on your learning style, I recommend these interactive literature guides and practice essays." }
      ];

      const messageContainer = document.querySelector('.message-container');
      if (!messageContainer) return;

      let currentIndex = 0;
      let visibleMessages = [];
      let isAnimating = false;

      const createTypingIndicator = () => {
        const typing = document.createElement('div');
        typing.className = 'message-bubble ai-message';
        typing.innerHTML = '<span class="typing-indicator"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></span>';
        return typing;
      };

      const typeText = async (element, text) => {
        element.textContent = '';
        for (let i = 0; i < text.length; i++) {
          element.textContent += text[i];
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      };

      async function addMessage() {
        if (isAnimating || !messageContainer) return;
        isAnimating = true;

        if (currentIndex < messages.length) {
          const message = messages[currentIndex];
          const messageElement = document.createElement('div');
          messageElement.className = `message-bubble ${message.type}-message`;

          if (message.type === 'ai') {
            const typing = createTypingIndicator();
            messageContainer.appendChild(typing);
            await new Promise(resolve => setTimeout(resolve, 1000));
            typing.remove();
          }

          messageContainer.appendChild(messageElement);

          if (message.type === 'ai') {
            await typeText(messageElement, message.text);
          } else {
            messageElement.textContent = message.text;
          }

          visibleMessages.push(messageElement);

          if (visibleMessages.length > 2) {
            const oldestMessage = visibleMessages.shift();
            oldestMessage.style.opacity = '0';
            oldestMessage.style.transform = 'scale(0.8)';
            setTimeout(() => oldestMessage.remove(), 500);
          }

          currentIndex++;

          if (currentIndex === messages.length) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            messageContainer.innerHTML = '';
            visibleMessages = [];
            currentIndex = 0;
          }

          isAnimating = false;
        }
      }

      addMessage();

      if (window.messageAnimationInterval) {
        clearInterval(window.messageAnimationInterval);
      }

      window.messageAnimationInterval = setInterval(async () => {
        if (!isAnimating) {
          await addMessage();
        }
      }, 3000);
    };

    // Initialize feature list animation with sequential line animation
    const startFeatureAnimation = () => {
      const features = document.querySelectorAll('.feature-item');
      if (!features.length) return;

      // Hide all features initially
      features.forEach((feature, idx) => {
        feature.style.opacity = '0';
        feature.style.transform = 'translateY(20px)';
        feature.style.position = 'relative';
        feature.style.display = 'none';
        feature.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      });

      const maxVisible = 4; // Maximum number of visible items
      let nextIndex = 0;
      const visibleItems = [];

      const showNextFeature = () => {
        if (visibleItems.length >= maxVisible) {
          // Remove first item with animation
          const itemToRemove = visibleItems.shift();
          itemToRemove.style.opacity = '0';
          itemToRemove.style.transform = 'translateY(-20px)';
          
          // Hide it after animation completes
          setTimeout(() => {
            itemToRemove.style.display = 'none';
          }, 500);
        }

        // Get next feature to show
        const nextFeature = features[nextIndex];
        
        // Prepare it for animation
        nextFeature.style.display = 'flex';
        nextFeature.style.opacity = '0';
        nextFeature.style.transform = 'translateY(20px)';
        
        // Trigger animation after a small delay
        setTimeout(() => {
          nextFeature.style.opacity = '1';
          nextFeature.style.transform = 'translateY(0)';
        }, 50);
        
        // Add to visible items
        visibleItems.push(nextFeature);
        
        // Update index for next item
        nextIndex = (nextIndex + 1) % features.length;
        
        // Continue animation
        setTimeout(showNextFeature, 2000);
      };

      // Start the animation
      showNextFeature();
    };

    const cleanupAnimation = () => {
      if (window.messageAnimationInterval) {
        clearInterval(window.messageAnimationInterval);
        window.messageAnimationInterval = null;
      }
      window.messageAnimationRunning = false;
    };

    // Start animations when component mounts
    startMessageAnimation();
    setTimeout(startFeatureAnimation, 500);

    // Cleanup on unmount
    return () => cleanupAnimation();
  }, []);

  return (
    <div id="student-ai-assistant" style={{
      background: `linear-gradient(135deg, rgba(0, 51, 102, 0.66), rgba(0, 0, 0, 0.5)), url('https://openaimaster.com/wp-content/uploads/2023/10/a-detailed-portrait-of-a-white-teacher-talking-wit-min-1600x1067.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '670px' // Increased height
    }}>
      <div className="main-heading-ai" style={{ textAlign: 'center', width: '100%', display: 'flex', justifyContent: 'center', fontSize: '2.5rem', textDecoration: 'underline' }}>AI Assistant</div>
      
      <div className="assistant-container" style={{ height: '600px' }}> {/* Reduced container height */}
        <div className="animation-side" style={{ flex: '1.3' }}> {/* Enlarged animation side */}
          <div className="ai-interface" style={{ transform: 'scale(1.2)', transformOrigin: 'center center' }}> {/* Enlarged animation */}
            <div className="circle-container">
              <div className="orbital-circle"></div>
              <div className="orbital-circle"></div>
              <div className="orbital-circle"></div>
              <div className="particle" style={{ top: 0, left: '50%' }}></div>
              <div className="particle" style={{ bottom: 0, left: '50%' }}></div>
              <div className="particle" style={{ left: 0, top: '50%' }}></div>
              <div className="particle" style={{ right: 0, top: '50%' }}></div>
              <div className="particle" style={{ top: '25%', right: '25%' }}></div>
              <div className="particle" style={{ bottom: '25%', left: '25%' }}></div>
              <div className="particle" style={{ bottom: '53%', left: '1  5%' }}></div>
            </div>
            <div className="center-core">
              <div className="core-icon"></div>
            </div>
            <div className="message-container"></div>
          </div>
        </div>
        <div className="content-side">
          <h1 className="assistant-heading" style={{ textAlign: 'center', width: '100%' }}>Student AI Assistant</h1>
          <ul className="feature-list" style={{ maxHeight: '60vh', overflowY: 'hidden' }}>
            <li className="feature-item" style={{ maxWidth: '90%' }}>
              <span className="check-icon"><FaCheck /></span>
              <div className="feature-content">
                <span className="feature-text">Performance Analysis & Insights</span>
                <p className="feature-description">Get detailed analysis of your academic performance with actionable insights.</p>
              </div>
            </li>
            <li className="feature-item" style={{ maxWidth: '90%' }}>
              <span className="check-icon"><FaCheck /></span>
              <div className="feature-content">
                <span className="feature-text">Personalized Study Plans</span>
                <p className="feature-description">Custom learning paths tailored to your learning style and goals.</p>
              </div>
            </li>
            <li className="feature-item" style={{ maxWidth: '90%' }}>
              <span className="check-icon"><FaCheck /></span>
              <div className="feature-content">
                <span className="feature-text">24/7 Learning Support</span>
                <p className="feature-description">Round-the-clock assistance whenever you need help with your studies.</p>
              </div>
            </li>
            <li className="feature-item" style={{ maxWidth: '90%' }}>
              <span className="check-icon"><FaCheck /></span>
              <div className="feature-content">
                <span className="feature-text">AI-Powered Study Recommendations</span>
                <p className="feature-description">Smart resource suggestions based on your learning patterns.</p>
              </div>
            </li>
            <li className="feature-item" style={{ maxWidth: '90%' }}>
              <span className="check-icon"><FaCheck /></span>
              <div className="feature-content">
                <span className="feature-text">Interactive Learning Exercises</span>
                <p className="feature-description">Engage with dynamic content that adapts to your progress.</p>
              </div>
            </li>
            <li className="feature-item" style={{ maxWidth: '90%' }}> {/* Removed animation that was causing issues */}
              <span className="check-icon"><FaCheck /></span>
              <div className="feature-content">
                <span className="feature-text">Progress Tracking Dashboard</span>
                <p className="feature-description">Visualize your improvement with comprehensive analytics.</p>
              </div>
            </li>
            <li className="feature-item" style={{ maxWidth: '90%' }}>
              <span className="check-icon"><FaCheck /></span>
              <div className="feature-content">
                <span className="feature-text">Smart Content Recommendations</span>
                <p className="feature-description">Receive tailored learning materials based on your progress and learning style.</p>
              </div>
            </li>
            <li className="feature-item" style={{ maxWidth: '90%' }}>
              <span className="check-icon"><FaCheck /></span>
              <div className="feature-content">
                <span className="feature-text">Interactive Practice Sessions</span>
                <p className="feature-description">Engage with AI-powered practice questions that adapt to your skill level.</p>
              </div>
            </li>
            <li className="feature-item" style={{ maxWidth: '90%' }}>
              <span className="check-icon"><FaCheck /></span>
              <div className="feature-content">
                <span className="feature-text">Progress Tracking</span>
                <p className="feature-description">Monitor your improvement over time with detailed analytics and visualizations.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}