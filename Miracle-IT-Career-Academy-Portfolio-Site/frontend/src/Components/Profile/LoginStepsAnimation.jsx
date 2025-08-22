import React, { useEffect, useState } from 'react';
import { FaUser, FaLock, FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaArrowRight } from 'react-icons/fa';

const LoginStepsAnimation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [roleSelected, setRoleSelected] = useState(false);
  const [credentialsEntered, setCredentialsEntered] = useState(false);
  const [loginClicked, setLoginClicked] = useState(false);
  
  // Animation cycle
  useEffect(() => {
    const animationCycle = () => {
      // Step 1: Role Selection
      setTimeout(() => {
        setRoleSelected(true);
        // Step 2: Enter Credentials
        setTimeout(() => {
          setCredentialsEntered(true);
          // Step 3: Click Login
          setTimeout(() => {
            setLoginClicked(true);
            // Reset animation after a delay
            setTimeout(() => {
              setRoleSelected(false);
              setCredentialsEntered(false);
              setLoginClicked(false);
              // Start the cycle again
              animationCycle();
            }, 2000);
          }, 1500);
        }, 1500);
      }, 1000);
    };
    
    animationCycle();
    
    return () => {
      // Clear any remaining timeouts on unmount
      const highestId = window.setTimeout(() => {}, 0);
      for (let i = 0; i < highestId; i++) {
        clearTimeout(i);
      }
    };
  }, []);
  
  return (
    <div className="login-steps-animation">
      {/* Animation container */}
      <div className="animation-container">
        {/* Step 1: Role Selection */}
        <div className={`animation-step role-step ${roleSelected ? 'active' : ''}`}>
          <div className="role-icons">
            <div className={`role-icon admin ${roleSelected ? 'selected' : ''}`}>
              <FaUserShield />
            </div>
            <div className={`role-icon faculty ${roleSelected ? 'selected' : ''}`}>
              <FaChalkboardTeacher />
            </div>
            <div className={`role-icon student ${roleSelected ? 'selected' : ''}`}>
              <FaUserGraduate />
            </div>
          </div>
          <div className="step-label">Step 1: Select Role</div>
        </div>
        
        {/* Step 2: Enter Credentials */}
        <div className={`animation-step credentials-step ${credentialsEntered ? 'active' : ''}`}>
          <div className="credentials-form">
            <div className="credential-field username">
              <FaUser className="field-icon" />
              <div className="field-line">
                <div className={`typing-effect ${credentialsEntered ? 'typing' : ''}`}></div>
              </div>
            </div>
            <div className="credential-field password">
              <FaLock className="field-icon" />
              <div className="field-line">
                <div className={`typing-effect ${credentialsEntered ? 'typing' : ''}`}></div>
              </div>
            </div>
          </div>
          <div className="step-label">Step 2: Enter Credentials</div>
        </div>
        
        {/* Step 3: Click Login */}
        <div className={`animation-step login-step ${loginClicked ? 'active' : ''}`}>
          <button className={`login-button ${loginClicked ? 'clicked' : ''}`}>
            Login <FaArrowRight className="login-arrow" />
          </button>
          <div className="step-label">Step 3: Login</div>
        </div>
      </div>
    </div>
  );
};

export default LoginStepsAnimation;