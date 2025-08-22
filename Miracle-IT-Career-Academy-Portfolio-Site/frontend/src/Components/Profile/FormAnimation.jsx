import React, { useState, useEffect } from 'react';
import { FaChalkboardTeacher, FaUserGraduate, FaUserShield, FaLaptopCode } from 'react-icons/fa';
import './FormAnimation.css';

const FormAnimation = ({ selectedRole }) => {
  const [animationState, setAnimationState] = useState('idle');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationState(current => {
        switch(current) {
          case 'idle': return 'typing';
          case 'typing': return 'processing';
          case 'processing': return 'idle';
          default: return 'idle';
        }
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="form-animation-container">
      <div className="laptop-display">
        <div className="laptop-screen">
          <div className="screen-content">
            <div className="role-icon-container">
              {selectedRole === 'admin' && <FaUserShield className="role-icon admin" />}
              {selectedRole === 'faculty' && <FaChalkboardTeacher className="role-icon faculty" />}
              {selectedRole === 'student' && <FaUserGraduate className="role-icon student" />}
              {!selectedRole && <FaLaptopCode className="role-icon" />}
            </div>
            
            <div className="animation-stage">
              {animationState === 'idle' && (
                <div className="welcome-message">
                  <h3>Welcome to Miracle Academy</h3>
                  <p>Your learning journey begins here</p>
                </div>
              )}
              
              {animationState === 'typing' && (
                <div className="typing-animation">
                  <div className="code-line">
                    <span className="code-keyword">const</span> 
                    <span className="code-variable"> user </span>
                    <span className="code-operator">= </span>
                    <span className="code-bracket">{'{'}</span>
                  </div>
                  <div className="code-line indented">
                    <span className="code-property">role</span>
                    <span className="code-operator">: </span>
                    <span className="code-string">'{selectedRole || "user"}'</span>
                    <span className="code-comma">,</span>
                  </div>
                  <div className="code-line indented">
                    <span className="code-property">status</span>
                    <span className="code-operator">: </span>
                    <span className="code-string">'active'</span>
                  </div>
                  <div className="code-line">
                    <span className="code-bracket">{'}'}</span>
                    <span className="code-cursor"></span>
                  </div>
                </div>
              )}
              
              {animationState === 'processing' && (
                <div className="processing-animation">
                  <div className="processing-circle"></div>
                  <p>Preparing your dashboard...</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="laptop-base">
          <div className="laptop-keyboard"></div>
        </div>
      </div>
    </div>
  );
};

export default FormAnimation;