import React, { useState, useContext, useEffect } from 'react';
import { userAxiosInstance } from '../../api';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import './LoadingAnimation.css';
import './EnhancedFormAnimation.css';
import './ModernLoginForm.css';
import { UserContext } from '../UserContext';
import { FaUser, FaLock, FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaArrowRight } from 'react-icons/fa';
import LoadingAnimation from './LoadingAnimation.jsx';
import EnhancedFormAnimation from './EnhancedFormAnimation.jsx';
import ModernLoginForm from './ModernLoginForm.jsx';

const Login = () => {
  const [loginStep, setLoginStep] = useState('loading');
  const [credentials, setCredentials] = useState({ 
    username: '', 
    password: '',
    enrollment_id: '',
    date_of_birth: '',
    role: 'faculty'
  });
  const [selectedRole, setSelectedRole] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  // Show loading animation for 5 seconds before role selection
  useEffect(() => {
    if (loginStep === 'loading') {
      // Set a 5-second timer before showing role selection
      const timer = setTimeout(() => {
        setLoginStep('roleSelection');
      }, 5000);
      
      // Clean up timer if component unmounts
      return () => clearTimeout(timer);
    }
  }, [loginStep]);

  // Navigate immediately after successful login
  useEffect(() => {
    if (loginSuccess) {
      const role = localStorage.getItem('role');
      console.log('Navigating to role dashboard:', role);
      if (role === 'student') {
        navigate('/student');
      } else if (role === 'faculty') {
        navigate('/faculty');
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [loginSuccess, navigate]);

  const handleChange = e => setCredentials({ 
    ...credentials, 
    [e.target.name]: e.target.value 
  });

  const handleRoleSelection = role => {
    setSelectedRole(role);
    setCredentials({ ...credentials, role });
    setLoginStep('loginForm');
  };

  const handleSubmit = async e => {
    if (e) e.preventDefault();
    console.log('Submitting login with selectedRole:', selectedRole);
    console.log('Credentials:', credentials);
    try {
      let res;
      
      if (selectedRole === 'student') {
        res = await userAxiosInstance.post('student-login/', {
          enrollment_id: credentials.enrollment_id,
          date_of_birth: credentials.date_of_birth
        });
      } else {
        // Use a unique timestamp to prevent caching issues
        const timestamp = new Date().getTime();
        res = await userAxiosInstance.post(`token/`, {
          username: credentials.username,
          password: credentials.password,
          role: selectedRole // Send the selected role to the backend for validation
        });
      }
      
      console.log('Login successful, response:', res.data);
      
      // Store auth data in localStorage
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      
      // Make sure we have a valid role
      const userRole = res.data.role || (res.data.user && res.data.user.role);
      if (!userRole) {
        console.error('No role found in response data');
        throw new Error('Invalid response: No role information');
      }
      
      // Verify that the user's actual role matches their selected role
      if (userRole !== selectedRole) {
        console.error(`Role mismatch: Selected ${selectedRole} but user is ${userRole}`);
        throw new Error(`You don't have ${selectedRole} privileges. Please select the correct role.`);
      }
      
      localStorage.setItem('role', userRole);
      
      // Set user in context
      setUser({ 
        role: userRole, 
        username: selectedRole === 'student' ? res.data.user.username : credentials.username 
      });

      // Set login success and navigate immediately
      setLoginSuccess(true);
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed. Please check your credentials and try again.');
    }
  };

  // We don't need to show success or loading animations anymore
  // The user will be redirected immediately after successful login

  // Role selection screen
  if (loginStep === 'loading') {
    return (
      <div className="login-step loading-step">
        <LoadingAnimation />
      </div>
    );
  }
  
  if (loginStep === 'roleSelection') {
    return (
      <div className="login-step role-selection-step">
        <div className="role-selection-container">
          <div className="role-selection-header">
            <h1>Choose Your Role</h1>
            <p>Select how you want to access the platform</p>
          </div>
          
          <div className="role-cards">
            <div className="role-card admin" onClick={() => handleRoleSelection('admin')}>
              <div className="role-card-bg"></div>
              <div className="role-card-face role-card-front">
                <div className="role-icon-wrapper">
                  <div className="role-icon">
                    <FaUserShield />
                  </div>
                </div>
                <h3>Admin</h3>
                <p>System administration and management</p>
                <div className="role-card-footer">
                  <span>Select <FaArrowRight /></span>
                </div>
              </div>
              <div className="role-card-face role-card-back"></div>
            </div>
            
            <div className="role-card faculty" onClick={() => handleRoleSelection('faculty')}>
              <div className="role-card-bg"></div>
              <div className="role-card-face role-card-front">
                <div className="role-icon-wrapper">
                  <div className="role-icon">
                    <FaChalkboardTeacher />
                  </div>
                </div>
                <h3>Faculty</h3>
                <p>Course management and student assessment</p>
                <div className="role-card-footer">
                  <span>Select <FaArrowRight /></span>
                </div>
              </div>
              <div className="role-card-face role-card-back"></div>
            </div>
            
            <div className="role-card student" onClick={() => handleRoleSelection('student')}>
              <div className="role-card-bg"></div>
              <div className="role-card-face role-card-front">
                <div className="role-icon-wrapper">
                  <div className="role-icon">
                    <FaUserGraduate />
                  </div>
                </div>
                <h3>Student</h3>
                <p>Access courses and track progress</p>
                <div className="role-card-footer">
                  <span>Select <FaArrowRight /></span>
                </div>
              </div>
              <div className="role-card-face role-card-back"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login form screen
  return (
    <div className="login-fullscreen">
      <div className="login-background">
        <div className="login-circles">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
        </div>
        
        <div className="login-content">
          <div className="login-left-panel">
            <div className="login-logo">
              <h1>Miracle <span>Academy</span></h1>
            </div>
            <div className="login-animation">
              <EnhancedFormAnimation selectedRole={selectedRole} />
            </div>
            <div className="login-tagline">
              <h2>Transform Your Future</h2>
              <p>Join our community of learners and achieve your goals</p>
            </div>
          </div>
          
          <div className="login-right-panel">
            <ModernLoginForm 
              selectedRole={selectedRole}
              credentials={credentials}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              setLoginStep={setLoginStep}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;