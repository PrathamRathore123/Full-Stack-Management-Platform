import React from 'react';
import './Explore-certificate.css';
import Certificate from '../Images/Certificatemiracle.png';

const ExploreCertificate = () => {
  return (
    <div className="certificate-section">
      <div className="certificate-bg-shape"></div>
      
      <h1 className="certificate-heading">Get a Certificate</h1>
      
      <div className="certificate-container">
        {/* Left side - Certificate Information */}
        <div className="certificate-content">
          <div className="certificate-badge">ISO 9001:2015</div>
          <h3>Professional Certified Recognition</h3>
          <p className="certificate-description">
            After completing your course, you'll receive a professional certificate as shown here. 
            Our certificates are recognized by leading employers and validate your skills and knowledge 
            in the industry.
          </p>
          
          <div className="certificate-features-row">
            <div className="feature-box">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span>ISO Certified</span>
            </div>
            
            <div className="feature-box">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
                </svg>
              </div>
              <span>Industry Recognized</span>
            </div>
            
            <div className="feature-box">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>
              <span>Verifiable</span>
            </div>
          </div>
          
          <button className="enroll-now-btn">
            Start Your Journey Now
            <svg className="btn-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/>
            </svg>
          </button>
        </div>
        
        {/* Right side - Certificate Image */}
        <div className="certificate-preview">
          <div className="certificate-image-container">
            <img src={Certificate} alt="Course Certificate" className="certificate-image" />
          </div>
          <div className="certificate-shine"></div>
        </div>
      </div>
    </div>
  );
};

export default ExploreCertificate;