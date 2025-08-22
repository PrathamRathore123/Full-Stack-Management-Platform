import React from 'react';
import { FaGraduationCap, FaBook, FaLaptop } from 'react-icons/fa';
import './LoadingAnimation.css';
import logo from '../Images/Logo-miracle.png';

const LoadingAnimation = () => {
  return (
    <div className="intro-animation">
      <div className="academy-logo">
          <img src={logo} alt="" />
      </div>
      
      <div className="loading-progress-login">
        <div className="progress-bar-login">
          <div className="progress-fill-login"></div>
        </div>
        <div className="progress-text">Loading...</div>
      </div>
      
      <div className="loading-steps">
        <div className="step-item">
          <div className="step-icon">
            <FaGraduationCap />
          </div>
          <div className="step-line"></div>
          <div className="step-label">Choose Role</div>
        </div>
        
        <div className="step-item">
          <div className="step-icon">
            <FaBook />
          </div>
          <div className="step-line"></div>
          <div className="step-label">Enter Credentials</div>
        </div>
        
        <div className="step-item">
          <div className="step-icon">
            <FaLaptop />
          </div>
          <div className="step-label">Access Portal</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;