import React, { useState, useEffect, useRef } from 'react';
import './Hometwo.css';

export default function Hometwo() {
  const [activeTab, setActiveTab] = useState('admin');
  const [isVisible, setIsVisible] = useState(false);
  const [animationStep, setAnimationStep] = useState(1);
  const sectionRef = useRef(null);
  
  // Handle tab change with animation
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setAnimationStep(1); // Reset animation step when tab changes
  };
  
  // Progress animation steps with smoother timing
  useEffect(() => {
    if (activeTab) {
      // Reset animation step when tab changes
      setAnimationStep(1);
      
      // Create a timer with increasing intervals for a more natural flow
      const timers = [
        setTimeout(() => setAnimationStep(2), 2500),
        setTimeout(() => setAnimationStep(3), 5000),
        setTimeout(() => setAnimationStep(4), 7500),
        setTimeout(() => setAnimationStep(1), 11000)
      ];
      
      return () => timers.forEach(timer => clearTimeout(timer));
    }
  }, [activeTab]);
  
  // Intersection Observer for section visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  return (
    <>
    <section className={`role-section ${isVisible ? 'visible' : ''}`} ref={sectionRef}>
        <div className="container">
            <div className="section-header">
                <span className="section-badge">Secure Access</span>
                <h2 className="animated-title">Role-Based Access Control</h2>
                <p className="animated-subtitle">Our platform provides tailored experiences for different user roles, ensuring everyone has the right tools and access for their specific needs.</p>
            </div>
            
            <div className="tabs-container">
                {/* Tab Navigation */}
                <div className="tab-navigation">
                    <button 
                        onClick={() => handleTabChange('admin')}
                        className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                    >
                        <i className="ri-admin-line"></i> Admin Dashboard
                    </button>
                    <button 
                        onClick={() => handleTabChange('faculty')}
                        className={`tab-btn ${activeTab === 'faculty' ? 'active' : ''}`}
                    >
                        <i className="ri-user-2-line"></i> Faculty Portal
                    </button>
                    <button 
                        onClick={() => handleTabChange('student')}
                        className={`tab-btn ${activeTab === 'student' ? 'active' : ''}`}
                    >
                        <i className="ri-user-line"></i> Student Portal
                    </button>
                    <div className="tab-indicator"></div>
                </div>
                
                {/* Tab Content */}
                <div className="tab-content-container">
                    {/* Admin Tab Content */}
                    <div className={`tab-content ${activeTab === 'admin' ? 'active' : ''}`}>
                        <div className="tab-grid">
                            <div className="feature-list">
                                <h3 className="role-title">Admin Dashboard Features</h3>
                                <ul>
                                    <li className="feature-item">
                                        <div className="feature-icon pulse">
                                            <i className="ri-check-line"></i>
                                        </div>
                                        <div className="feature-details">
                                            <h4>Complete System Configuration</h4>
                                            <p>Full control over platform settings, modules, and integrations.</p>
                                        </div>
                                    </li>
                                    <li className="feature-item">
                                        <div className="feature-icon pulse">
                                            <i className="ri-check-line"></i>
                                        </div>
                                        <div className="feature-details">
                                            <h4>User Management</h4>
                                            <p>Create, edit, and manage all user accounts and permission levels.</p>
                                        </div>
                                    </li>
                                    <li className="feature-item">
                                        <div className="feature-icon pulse">
                                            <i className="ri-check-line"></i>
                                        </div>
                                        <div className="feature-details">
                                            <h4>Advanced Analytics Dashboard</h4>
                                            <p>Comprehensive data visualization and reporting tools.</p>
                                        </div>
                                    </li>
                                    <li className="feature-item">
                                        <div className="feature-icon pulse">
                                            <i className="ri-check-line"></i>
                                        </div>
                                        <div className="feature-details">
                                            <h4>System Monitoring</h4>
                                            <p>Real-time performance metrics and system health monitoring.</p>
                                        </div>
                                    </li>
                                </ul>
                                <div className="feature-cta">
                                    <button className="cta-button admin-cta">
                                        <span>Learn More</span>
                                        <i className="ri-arrow-right-line"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="animation-container">
                                <div className="login-animation">
                                    <div className={`animation-step ${animationStep >= 1 ? 'active' : ''}`}>
                                        <div className="login-screen">
                                            <div className="login-header">
                                                <i className="ri-lock-line"></i> Admin Login
                                            </div>
                                            <div className="login-form">
                                                <div className="form-field">
                                                    <label>Username</label>
                                                    <div className="input">admin@example.com</div>
                                                </div>
                                                <div className="form-field">
                                                    <label>Password</label>
                                                    <div className="input">••••••••</div>
                                                </div>
                                                <div className="login-button">Login</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`animation-step ${animationStep >= 2 ? 'active' : ''}`}>
                                        <div className="verification-screen">
                                            <div className="verification-icon">
                                                <i className="ri-shield-check-line"></i>
                                            </div>
                                            <div className="verification-text">
                                                <div className="verification-title">2FA Verification</div>
                                                <div className="verification-code">
                                                    <span>•</span>
                                                    <span>•</span>
                                                    <span>•</span>
                                                    <span>•</span>
                                                    <span>•</span>
                                                    <span>•</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`animation-step ${animationStep >= 3 ? 'active' : ''}`}>
                                        <div className="dashboard-preview admin-dashboard">
                                            <div className="dashboard-header">
                                                <div className="dashboard-title">Admin Dashboard</div>
                                                <div className="dashboard-user">
                                                    <i className="ri-admin-line"></i>
                                                </div>
                                            </div>
                                            <div className="dashboard-widgets">
                                                <div className="widget analytics"></div>
                                                <div className="widget users"></div>
                                                <div className="widget settings"></div>
                                                <div className="widget monitoring"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`animation-step ${animationStep >= 4 ? 'active' : ''}`}>
                                        <div className="success-message">
                                            <div className="success-icon">
                                                <i className="ri-check-double-line"></i>
                                            </div>
                                            <div className="success-text">
                                                <div>Full Admin Access</div>
                                                <div className="success-subtext">Complete system control</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="animation-progress">
                                    <div className={`progress-dot ${animationStep >= 1 ? 'active' : ''}`}></div>
                                    <div className={`progress-dot ${animationStep >= 2 ? 'active' : ''}`}></div>
                                    <div className={`progress-dot ${animationStep >= 3 ? 'active' : ''}`}></div>
                                    <div className={`progress-dot ${animationStep >= 4 ? 'active' : ''}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Faculty Tab Content */}
                    <div className={`tab-content ${activeTab === 'faculty' ? 'active' : ''}`}>
                        <div className="tab-grid">
                            <div className="feature-list">
                                <h3 className="role-title faculty-title">Faculty Portal Features</h3>
                                <ul>
                                    <li className="feature-item">
                                        <div className="feature-icon faculty-icon pulse">
                                            <i className="ri-check-line"></i>
                                        </div>
                                        <div className="feature-details">
                                            <h4>Course Management</h4>
                                            <p>Create and manage course content, assignments, and assessments.</p>
                                        </div>
                                    </li>
                                    <li className="feature-item">
                                        <div className="feature-icon faculty-icon pulse">
                                            <i className="ri-check-line"></i>
                                        </div>
                                        <div className="feature-details">
                                            <h4>Student Progress Tracking</h4>
                                            <p>Monitor individual and class performance with detailed analytics.</p>
                                        </div>
                                    </li>
                                    <li className="feature-item">
                                        <div className="feature-icon faculty-icon pulse">
                                            <i className="ri-check-line"></i>
                                        </div>
                                        <div className="feature-details">
                                            <h4>Content Upload & Management</h4>
                                            <p>Easy tools for uploading lectures, resources, and learning materials.</p>
                                        </div>
                                    </li>
                                    <li className="feature-item">
                                        <div className="feature-icon faculty-icon pulse">
                                            <i className="ri-check-line"></i>
                                        </div>
                                        <div className="feature-details">
                                            <h4>Communication Tools</h4>
                                            <p>Direct messaging, announcements, and feedback systems.</p>
                                        </div>
                                    </li>
                                </ul>
                                <div className="feature-cta">
                                    <button className="cta-button faculty-cta">
                                        <span>Learn More</span>
                                        <i className="ri-arrow-right-line"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="animation-container faculty-container">
                                <div className="login-animation">
                                    <div className={`animation-step ${animationStep >= 1 ? 'active' : ''}`}>
                                        <div className="login-screen">
                                            <div className="login-header faculty-header">
                                                <i className="ri-user-2-line"></i> Faculty Login
                                            </div>
                                            <div className="login-form">
                                                <div className="form-field">
                                                    <label>Username</label>
                                                    <div className="input">faculty@example.com</div>
                                                </div>
                                                <div className="form-field">
                                                    <label>Password</label>
                                                    <div className="input">••••••••</div>
                                                </div>
                                                <div className="login-button faculty-button">Login</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`animation-step ${animationStep >= 2 ? 'active' : ''}`}>
                                        <div className="verification-screen">
                                            <div className="verification-icon faculty-icon">
                                                <i className="ri-user-search-line"></i>
                                            </div>
                                            <div className="verification-text">
                                                <div className="verification-title">Identity Verification</div>
                                                <div className="faculty-id">
                                                    <div className="id-card">
                                                        <div className="id-photo"></div>
                                                        <div className="id-info">Faculty ID</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`animation-step ${animationStep >= 3 ? 'active' : ''}`}>
                                        <div className="dashboard-preview faculty-dashboard">
                                            <div className="dashboard-header">
                                                <div className="dashboard-title">Faculty Portal</div>
                                                <div className="dashboard-user">
                                                    <i className="ri-user-2-line"></i>
                                                </div>
                                            </div>
                                            <div className="dashboard-widgets">
                                                <div className="widget courses"></div>
                                                <div className="widget students"></div>
                                                <div className="widget content"></div>
                                                <div className="widget messages"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`animation-step ${animationStep >= 4 ? 'active' : ''}`}>
                                        <div className="success-message">
                                            <div className="success-icon faculty-success">
                                                <i className="ri-check-double-line"></i>
                                            </div>
                                            <div className="success-text">
                                                <div>Faculty Access Granted</div>
                                                <div className="success-subtext">Teaching tools activated</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="animation-progress">
                                    <div className={`progress-dot faculty-dot ${animationStep >= 1 ? 'active' : ''}`}></div>
                                    <div className={`progress-dot faculty-dot ${animationStep >= 2 ? 'active' : ''}`}></div>
                                    <div className={`progress-dot faculty-dot ${animationStep >= 3 ? 'active' : ''}`}></div>
                                    <div className={`progress-dot faculty-dot ${animationStep >= 4 ? 'active' : ''}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Student Tab Content */}
                    <div className={`tab-content ${activeTab === 'student' ? 'active' : ''}`}>
                        <div className="tab-grid">
                            <div className="feature-list">
                                <h3 className="role-title student-title">Student Portal Features</h3>
                                <ul>
                                    <li className="feature-item">
                                        <div className="feature-icon student-icon pulse">
                                            <i className="ri-check-line"></i>
                                        </div>
                                        <div className="feature-details">
                                            <h4>Course Access</h4>
                                            <p>Browse and access enrolled courses and learning materials.</p>
                                        </div>
                                    </li>
                                    <li className="feature-item">
                                        <div className="feature-icon student-icon pulse">
                                            <i className="ri-check-line"></i>
                                        </div>
                                        <div className="feature-details">
                                            <h4>Progress Tracking</h4>
                                            <p>View personal learning progress, grades, and completion status.</p>
                                        </div>
                                    </li>
                                    <li className="feature-item">
                                        <div className="feature-icon student-icon pulse">
                                            <i className="ri-check-line"></i>
                                        </div>
                                        <div className="feature-details">
                                            <h4>Assignment Submission</h4>
                                            <p>Submit assignments and receive feedback from instructors.</p>
                                        </div>
                                    </li>
                                    <li className="feature-item">
                                        <div className="feature-icon student-icon pulse">
                                            <i className="ri-check-line"></i>
                                        </div>
                                        <div className="feature-details">
                                            <h4>AI Learning Assistant</h4>
                                            <p>Access to AI-powered learning recommendations and support.</p>
                                        </div>
                                    </li>
                                </ul>
                                <div className="feature-cta">
                                    <button className="cta-button student-cta">
                                        <span>Learn More</span>
                                        <i className="ri-arrow-right-line"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="animation-container student-container">
                                <div className="login-animation">
                                    <div className={`animation-step ${animationStep >= 1 ? 'active' : ''}`}>
                                        <div className="login-screen">
                                            <div className="login-header student-header">
                                                <i className="ri-user-line"></i> Student Login
                                            </div>
                                            <div className="login-form">
                                                <div className="form-field">
                                                    <label>Username</label>
                                                    <div className="input">student@example.com</div>
                                                </div>
                                                <div className="form-field">
                                                    <label>Password</label>
                                                    <div className="input">••••••••</div>
                                                </div>
                                                <div className="login-button student-button">Login</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`animation-step ${animationStep >= 2 ? 'active' : ''}`}>
                                        <div className="verification-screen">
                                            <div className="verification-icon student-icon">
                                                <i className="ri-book-open-line"></i>
                                            </div>
                                            <div className="verification-text">
                                                <div className="verification-title">Course Verification</div>
                                                <div className="enrollment-check">
                                                    <div className="enrollment-status">
                                                        <i className="ri-check-line"></i> Enrolled
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`animation-step ${animationStep >= 3 ? 'active' : ''}`}>
                                        <div className="dashboard-preview student-dashboard">
                                            <div className="dashboard-header">
                                                <div className="dashboard-title">Student Portal</div>
                                                <div className="dashboard-user">
                                                    <i className="ri-user-line"></i>
                                                </div>
                                            </div>
                                            <div className="dashboard-widgets">
                                                <div className="widget my-courses"></div>
                                                <div className="widget progress"></div>
                                                <div className="widget assignments"></div>
                                                <div className="widget ai-assistant"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`animation-step ${animationStep >= 4 ? 'active' : ''}`}>
                                        <div className="success-message">
                                            <div className="success-icon student-success">
                                                <i className="ri-check-double-line"></i>
                                            </div>
                                            <div className="success-text">
                                                <div>Student Access Granted</div>
                                                <div className="success-subtext">Learning journey begins</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="animation-progress">
                                    <div className={`progress-dot student-dot ${animationStep >= 1 ? 'active' : ''}`}></div>
                                    <div className={`progress-dot student-dot ${animationStep >= 2 ? 'active' : ''}`}></div>
                                    <div className={`progress-dot student-dot ${animationStep >= 3 ? 'active' : ''}`}></div>
                                    <div className={`progress-dot student-dot ${animationStep >= 4 ? 'active' : ''}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="section-footer">
                <div className="footer-cta">
                    <h3>Ready to get started?</h3>
                    <p>Experience our role-based access control system today.</p>
                    <button className="primary-button">
                        <span>Request Demo</span>
                        <i className="ri-arrow-right-line"></i>
                    </button>
                </div>
            </div>
        </div>
    </section>
    </>
  )
}