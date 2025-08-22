import React, { useState, useEffect } from 'react';
import { FaChalkboardTeacher, FaUserGraduate, FaUserShield, FaLaptopCode, FaServer, FaDatabase, FaShieldAlt, FaUserCog, FaFingerprint, FaLock } from 'react-icons/fa';
import './EnhancedFormAnimation.css';

const EnhancedFormAnimation = ({ selectedRole }) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const getRoleColor = () => {
    switch(selectedRole) {
      case 'admin': return '#4a6fa5';
      case 'faculty': return '#6b8e23';
      case 'student': return '#cd853f';
      default: return '#FF4500';
    }
  };

  const getRoleIcon = () => {
    switch(selectedRole) {
      case 'admin': return <FaUserShield />;
      case 'faculty': return <FaChalkboardTeacher />;
      case 'student': return <FaUserGraduate />;
      default: return <FaLaptopCode />;
    }
  };

  return (
    <div className="enhanced-animation-container">
      <div className="hologram-effect">
        <div className="hologram-base">
          <div className="base-lights">
            <div className="base-light"></div>
            <div className="base-light"></div>
            <div className="base-light"></div>
          </div>
        </div>
        <div className="hologram-projection">
          <div className="hologram-content" style={{ '--role-color': getRoleColor() }}>
            <div className="hologram-grid"></div>
            
            {animationPhase === 0 && (
              <div className="hologram-scene scene-welcome">
                <div className="role-icon-large">{getRoleIcon()}</div>
                <div className="welcome-text">
                  <h3>Welcome</h3>
                  <p>{selectedRole || 'User'}</p>
                </div>
                <div className="welcome-rings">
                  <div className="welcome-ring"></div>
                  <div className="welcome-ring"></div>
                </div>
              </div>
            )}
            
            {animationPhase === 1 && (
              <div className="hologram-scene scene-security">
                <div className="security-ring">
                  <FaFingerprint className="security-icon" />
                </div>
                <div className="security-scan"></div>
                <div className="security-particles">
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i} 
                      className="security-particle"
                      style={{ 
                        '--delay': `${i * 0.1}s`,
                        '--size': `${Math.random() * 4 + 2}px`
                      }}
                    ></div>
                  ))}
                </div>
                <p>Verifying identity...</p>
              </div>
            )}
            
            {animationPhase === 2 && (
              <div className="hologram-scene scene-data">
                <div className="data-grid">
                  {[...Array(16)].map((_, i) => (
                    <div 
                      key={i} 
                      className="data-node"
                      style={{ 
                        animationDelay: `${i * 0.1}s`,
                        opacity: Math.random() * 0.5 + 0.5
                      }}
                    ></div>
                  ))}
                </div>
                <div className="data-icons">
                  <FaDatabase className="data-icon" />
                  <FaServer className="data-icon" />
                </div>
                <div className="data-lines">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className="data-line"
                      style={{ 
                        '--delay': `${i * 0.2}s`,
                        '--height': `${Math.random() * 20 + 5}px`
                      }}
                    ></div>
                  ))}
                </div>
                <p>Loading profile data...</p>
              </div>
            )}
            
            {animationPhase === 3 && (
              <div className="hologram-scene scene-ready">
                <div className="ready-circle">
                  <FaLock className="ready-icon" />
                </div>
                <div className="ready-pulse"></div>
                <div className="ready-checkmark">
                  <svg viewBox="0 0 52 52">
                    <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                    <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                  </svg>
                </div>
                <p>Secure connection established</p>
              </div>
            )}
          </div>
        </div>
        <div className="hologram-reflection"></div>
      </div>
    </div>
  );
};

export default EnhancedFormAnimation;