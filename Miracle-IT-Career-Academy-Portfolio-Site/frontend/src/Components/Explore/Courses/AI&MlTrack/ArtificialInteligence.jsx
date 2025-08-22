import React, { useState, useEffect, useContext } from 'react';
import './ArtificialIntelligence.css';
import { FaBrain, FaRobot, FaChartLine, FaCode, FaDatabase, FaUserTie, FaHospital, FaShoppingCart, FaCar } from 'react-icons/fa';
import { enrollInCourse, getUserEnrollments } from '../../../../api';
import { UserContext } from '../../../UserContext';

const ArtificialIntelligence = () => {
  const { user } = useContext(UserContext || {});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [apiError, setApiError] = useState(false);
  
  // Course ID for AI course - replace with actual ID from your database
  const courseId = 3;

  useEffect(() => {
    // Check if user is enrolled in this course
    const checkEnrollment = async () => {
      if (user) {
        try {
          const enrollments = await getUserEnrollments();
          if (enrollments) {
            const enrolled = enrollments.some(enrollment => enrollment.course === courseId);
            setIsEnrolled(enrolled);
          }
        } catch (err) {
          console.error('Error checking enrollment status:', err);
          // Continue showing the page even if enrollment check fails
        }
      }
    };
    
    checkEnrollment();
  }, [user, courseId]);

  const handleEnroll = async () => {
    if (!user) {
      alert('Please log in to enroll in this course');
      return;
    }

    try {
      setEnrolling(true);
      await enrollInCourse(courseId);
      setIsEnrolled(true);
    } catch (err) {
      console.error('Error enrolling in course:', err);
      alert('Failed to enroll in course. Please try again later.');
    } finally {
      setEnrolling(false);
    }
  };

  const scrollToEnroll = () => {
    document.querySelector('.ai-enrollment').scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="ai-course-container">
      <div className="ai-hero">
        <div className="ai-hero-content">
          <h1>Artificial Intelligence Mastery Program</h1>
          <p>Dive into the world of AI and learn how to build intelligent systems that can perceive, learn, reason, and act. This comprehensive program covers everything from foundational concepts to cutting-edge applications.</p>
          <button onClick={scrollToEnroll} className="ai-hero-cta">Explore Course</button>
        </div>
        <FaBrain className="ai-hero-graphic" />
      </div>

      <div className="ai-course-highlights">
        <div className="highlight-card">
          <div className="highlight-icon">
            <FaRobot />
          </div>
          <h3>Comprehensive AI Curriculum</h3>
          <p>Our 16-week program covers machine learning, neural networks, natural language processing, computer vision, and reinforcement learning with hands-on projects.</p>
        </div>
        
        <div className="highlight-card">
          <div className="highlight-icon">
            <FaChartLine />
          </div>
          <h3>Industry-Relevant Skills</h3>
          <p>Learn to implement AI solutions using TensorFlow, PyTorch, and other industry-standard tools and frameworks used by top tech companies.</p>
        </div>
        
        <div className="highlight-card">
          <div className="highlight-icon">
            <FaCode />
          </div>
          <h3>Capstone Project</h3>
          <p>Apply your knowledge to build a complete AI solution for a real-world problem, with guidance from industry experts and mentors.</p>
        </div>
      </div>

      <div className="ai-course-content">
        <div className="content-header">
          <h2>Course Curriculum</h2>
          <p>Our structured learning path takes you from AI fundamentals to advanced applications</p>
        </div>
        
        <div className="course-timeline">
          <div className="timeline-line"></div>
          
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>Foundations of Artificial Intelligence</h3>
              <p>Begin your AI journey with core concepts, history, and the ethical considerations of artificial intelligence.</p>
              <div className="timeline-topics">
                <span className="topic-tag">AI History</span>
                <span className="topic-tag">Types of AI</span>
                <span className="topic-tag">Ethics in AI</span>
                <span className="topic-tag">Python for AI</span>
              </div>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>Machine Learning Fundamentals</h3>
              <p>Master the core principles of machine learning, including supervised and unsupervised learning algorithms.</p>
              <div className="timeline-topics">
                <span className="topic-tag">Regression</span>
                <span className="topic-tag">Classification</span>
                <span className="topic-tag">Clustering</span>
                <span className="topic-tag">Model Evaluation</span>
              </div>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>Deep Learning & Neural Networks</h3>
              <p>Explore the architecture and applications of neural networks and deep learning models.</p>
              <div className="timeline-topics">
                <span className="topic-tag">Neural Networks</span>
                <span className="topic-tag">CNN</span>
                <span className="topic-tag">RNN</span>
                <span className="topic-tag">TensorFlow</span>
                <span className="topic-tag">PyTorch</span>
              </div>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>Natural Language Processing</h3>
              <p>Learn how to process and analyze human language data for applications like chatbots and sentiment analysis.</p>
              <div className="timeline-topics">
                <span className="topic-tag">Text Processing</span>
                <span className="topic-tag">Sentiment Analysis</span>
                <span className="topic-tag">Language Models</span>
                <span className="topic-tag">Transformers</span>
              </div>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>Computer Vision</h3>
              <p>Discover techniques for enabling computers to see, identify and process images like humans do.</p>
              <div className="timeline-topics">
                <span className="topic-tag">Image Processing</span>
                <span className="topic-tag">Object Detection</span>
                <span className="topic-tag">Facial Recognition</span>
                <span className="topic-tag">OpenCV</span>
              </div>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>Reinforcement Learning</h3>
              <p>Study how agents can learn to make decisions by taking actions in an environment to maximize rewards.</p>
              <div className="timeline-topics">
                <span className="topic-tag">Q-Learning</span>
                <span className="topic-tag">Policy Gradients</span>
                <span className="topic-tag">Deep RL</span>
                <span className="topic-tag">Game AI</span>
              </div>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>AI in Production</h3>
              <p>Learn to deploy AI models to production environments and integrate them with existing systems.</p>
              <div className="timeline-topics">
                <span className="topic-tag">Model Deployment</span>
                <span className="topic-tag">API Development</span>
                <span className="topic-tag">Cloud Services</span>
                <span className="topic-tag">Monitoring</span>
              </div>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>Capstone Project</h3>
              <p>Apply everything you've learned to build a complete AI solution for a real-world problem.</p>
              <div className="timeline-topics">
                <span className="topic-tag">Project Planning</span>
                <span className="topic-tag">Implementation</span>
                <span className="topic-tag">Testing</span>
                <span className="topic-tag">Presentation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ai-applications">
        <div className="content-header">
          <h2>AI Applications</h2>
          <p>Discover how AI is transforming industries and creating new opportunities</p>
        </div>
        
        <div className="applications-grid">
          <div className="application-card">
            <div className="application-icon">
              <FaDatabase />
            </div>
            <h3>Data Analysis</h3>
            <p>Extract insights from complex datasets using AI-powered analytics tools</p>
          </div>
          
          <div className="application-card">
            <div className="application-icon">
              <FaUserTie />
            </div>
            <h3>Business Intelligence</h3>
            <p>Optimize business processes and decision-making with AI solutions</p>
          </div>
          
          <div className="application-card">
            <div className="application-icon">
              <FaHospital />
            </div>
            <h3>Healthcare</h3>
            <p>Improve diagnostics and patient care with AI-assisted medical systems</p>
          </div>
          
          <div className="application-card">
            <div className="application-icon">
              <FaShoppingCart />
            </div>
            <h3>E-commerce</h3>
            <p>Enhance customer experience with personalized recommendations</p>
          </div>
          
          <div className="application-card">
            <div className="application-icon">
              <FaCar />
            </div>
            <h3>Autonomous Systems</h3>
            <p>Develop self-driving vehicles and automated industrial systems</p>
          </div>
        </div>
      </div>

      <div className="ai-enrollment">
        <h2>Begin Your AI Journey Today</h2>
        <p>Join our comprehensive Artificial Intelligence program and gain the skills needed to excel in this rapidly growing field. Limited seats available for the upcoming batch.</p>
        
        {isEnrolled ? (
          <p className="enrolled-message">You are already enrolled in this course!</p>
        ) : (
          <button 
            className="enroll-button"
            onClick={handleEnroll}
            disabled={enrolling || !user}
          >
            {enrolling ? 'Enrolling...' : 'Enroll Now'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ArtificialIntelligence;