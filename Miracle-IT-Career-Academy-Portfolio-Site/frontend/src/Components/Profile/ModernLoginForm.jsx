import React from 'react';
import { FaUser, FaLock, FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaArrowRight } from 'react-icons/fa';
import './ModernLoginForm.css';

const ModernLoginForm = ({ 
  selectedRole, 
  credentials, 
  handleChange, 
  handleSubmit,
  setLoginStep 
}) => {
  // Set CSS variables based on role
  const getRoleColors = () => {
    switch(selectedRole) {
      case 'admin':
        return { 
          '--role-color': '#4a6fa5', 
          '--role-color-light': '#6a8bbd',
          '--role-rgb': '74, 111, 165'
        };
      case 'faculty':
        return { 
          '--role-color': '#6b8e23', 
          '--role-color-light': '#8fb82e',
          '--role-rgb': '107, 142, 35'
        };
      case 'student':
        return { 
          '--role-color': '#cd853f', 
          '--role-color-light': '#e9a55d',
          '--role-rgb': '205, 133, 63'
        };
      default:
        return { 
          '--role-color': '#FF4500', 
          '--role-color-light': '#FF7F50',
          '--role-rgb': '255, 69, 0'
        };
    }
  };

  return (
    <div className="modern-login-form-container" style={getRoleColors()}>
      <div className="modern-login-header">
        <h2>Welcome Back</h2>
        <p>Please login as {selectedRole}</p>
      </div>
      
      <div className="modern-selected-role">
        <div className="modern-role-badge">
          {selectedRole === 'admin' && <FaUserShield />}
          {selectedRole === 'faculty' && <FaChalkboardTeacher />}
          {selectedRole === 'student' && <FaUserGraduate />}
          <span>{selectedRole}</span>
        </div>
        <button className="modern-change-role-btn" onClick={() => setLoginStep('roleSelection')}>
          Change Role
        </button>
      </div>
      
      <form>
        {selectedRole !== 'student' ? (
          <>
            <div className="modern-form-input">
              <input 
                type="text" 
                name="username" 
                placeholder="Username" 
                value={credentials.username}
                onChange={handleChange} 
                required 
              />
              <FaUser className="input-icon" />
              <div className="input-highlight"></div>
            </div>
            <div className="modern-form-input">
              <input 
                type="password" 
                name="password" 
                placeholder="Password" 
                value={credentials.password}
                onChange={handleChange} 
                required 
              />
              <FaLock className="input-icon" />
              <div className="input-highlight"></div>
            </div>
          </>
        ) : (
          <>
            <div className="modern-form-input">
              <input 
                type="text" 
                name="enrollment_id" 
                placeholder="Enrollment ID" 
                value={credentials.enrollment_id}
                onChange={handleChange} 
                required 
              />
              <FaUser className="input-icon" />
              <div className="input-highlight"></div>
            </div>
            <div className="modern-form-input">
              <input 
                type="password" 
                name="date_of_birth" 
                placeholder="Date of Birth (ddmmyyyy)" 
                value={credentials.date_of_birth}
                onChange={handleChange} 
                required 
                pattern="\d{8}"
                title="Enter date in format ddmmyyyy"
              />
              <FaLock className="input-icon" />
              <div className="input-highlight"></div>
            </div>
          </>
        )}
        
        <button 
          type="button" 
          className="modern-login-submit-btn" 
          onClick={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
        >
          Login <FaArrowRight />
        </button>
      </form>
      
      <div className="modern-form-footer">
        <p>Secure login • Miracle Academy</p>
      </div>
    </div>
  );
};

export default ModernLoginForm;