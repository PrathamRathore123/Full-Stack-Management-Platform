import React from 'react';
import './StudentDashboard.css';

const StudentProfile = () => {
  return (
    <div className="dashboard-container">
      <h1>Student Profile</h1>
      <div className="dashboard-content">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-avatar">
              <div className="avatar-placeholder">JS</div>
            </div>
            <div className="profile-info">
              <h2>John Smith</h2>
              <p>Student ID: STU2023001</p>
              <p>Course: Full Stack Web Development</p>
              <p>Batch: 2023-24</p>
            </div>
            <button className="btn-secondary">Edit Profile</button>
          </div>
          
          <div className="profile-details">
            <div className="profile-section">
              <h3>Personal Information</h3>
              <div className="profile-fields">
                <div className="profile-field">
                  <label>Full Name</label>
                  <p>John Smith</p>
                </div>
                <div className="profile-field">
                  <label>Date of Birth</label>
                  <p>15 May, 1998</p>
                </div>
                <div className="profile-field">
                  <label>Gender</label>
                  <p>Male</p>
                </div>
                <div className="profile-field">
                  <label>Email</label>
                  <p>john.smith@example.com</p>
                </div>
                <div className="profile-field">
                  <label>Phone</label>
                  <p>+91 9876543210</p>
                </div>
                <div className="profile-field">
                  <label>Address</label>
                  <p>123 Main Street, Bangalore, Karnataka - 560001</p>
                </div>
              </div>
            </div>
            
            <div className="profile-section">
              <h3>Academic Information</h3>
              <div className="profile-fields">
                <div className="profile-field">
                  <label>Enrollment Date</label>
                  <p>10 Jan, 2023</p>
                </div>
                <div className="profile-field">
                  <label>Current Semester</label>
                  <p>2nd Semester</p>
                </div>
                <div className="profile-field">
                  <label>Academic Status</label>
                  <p className="status-good">Active</p>
                </div>
                <div className="profile-field">
                  <label>CGPA</label>
                  <p>3.8/4.0</p>
                </div>
              </div>
            </div>
            
            <div className="profile-section">
              <h3>Emergency Contact</h3>
              <div className="profile-fields">
                <div className="profile-field">
                  <label>Name</label>
                  <p>Mary Smith</p>
                </div>
                <div className="profile-field">
                  <label>Relationship</label>
                  <p>Mother</p>
                </div>
                <div className="profile-field">
                  <label>Phone</label>
                  <p>+91 9876543211</p>
                </div>
                <div className="profile-field">
                  <label>Email</label>
                  <p>mary.smith@example.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;