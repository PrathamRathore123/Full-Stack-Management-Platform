import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaArrowRight } from 'react-icons/fa';
import { FaLaptop } from 'react-icons/fa';
import './LoginAnimation.css';

const LoginAnimation = () => {
  const [step, setStep] = useState(1);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setStep(current => current < 3 ? current + 1 : 1);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="login-animation-wrapper">
      <div className="laptop-container">
        <div className="laptop-top">
          <div className="laptop-screen">
            <div className="laptop-content">
              <div className="login-steps-progress">
                <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>1</div>
                <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
                <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>2</div>
                <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
                <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>3</div>
              </div>
              
              <div className="login-steps-content">
                {step === 1 && (
                  <div className="step-content role-selection-step">
                    <h3>Select Your Role</h3>
                    <div className="role-icons-container">
                      <div className="role-icon-wrapper">
                        <div className="role-icon admin">
                          <FaUserShield />
                        </div>
                        <span>Admin</span>
                      </div>
                      <div className="role-icon-wrapper active">
                        <div className="role-icon faculty">
                          <FaChalkboardTeacher />
                        </div>
                        <span>Faculty</span>
                      </div>
                      <div className="role-icon-wrapper">
                        <div className="role-icon student">
                          <FaUserGraduate />
                        </div>
                        <span>Student</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {step === 2 && (
                  <div className="step-content credentials-step">
                    <h3>Enter Credentials</h3>
                    <div className="credentials-form">
                      <div className="credential-field">
                        <FaUser className="field-icon" />
                        <div className="field-input">
                          <div className="typing-effect">faculty</div>
                        </div>
                      </div>
                      <div className="credential-field">
                        <FaLock className="field-icon" />
                        <div className="field-input">
                          <div className="typing-effect password">••••••</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {step === 3 && (
                  <div className="step-content login-button-step">
                    <h3>Login</h3>
                    <button className="animated-login-button">
                      <span>Login</span>
                      <FaArrowRight />
                    </button>
                    <div className="login-pulse"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="laptop-bottom">
          <div className="laptop-keyboard"></div>
          <div className="laptop-touchpad"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginAnimation;