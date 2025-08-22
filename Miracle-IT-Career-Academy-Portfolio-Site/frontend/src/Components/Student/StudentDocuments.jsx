import React from 'react';
import './StudentDashboard.css';

const StudentDocuments = () => {
  return (
    <div className="dashboard-container">
      <h1>Documents & Certificates</h1>
      <div className="dashboard-content">
        <p>Access and download your documents and certificates.</p>
        
        <div className="documents-section">
          <h3>Academic Documents</h3>
          <div className="documents-list">
            <div className="document-card">
              <div className="document-icon">📄</div>
              <div className="document-info">
                <h4>Admission Letter</h4>
                <p>Uploaded on: 15 Jan, 2023</p>
              </div>
              <button className="btn-secondary">Download</button>
            </div>
            
            <div className="document-card">
              <div className="document-icon">📄</div>
              <div className="document-info">
                <h4>ID Card</h4>
                <p>Uploaded on: 20 Jan, 2023</p>
              </div>
              <button className="btn-secondary">Download</button>
            </div>
            
            <div className="document-card">
              <div className="document-icon">📄</div>
              <div className="document-info">
                <h4>Fee Receipt</h4>
                <p>Uploaded on: 25 Jan, 2023</p>
              </div>
              <button className="btn-secondary">Download</button>
            </div>
          </div>
        </div>
        
        <div className="certificates-section">
          <h3>Certificates</h3>
          <div className="documents-list">
            <div className="document-card">
              <div className="document-icon">🎓</div>
              <div className="document-info">
                <h4>Web Development Course</h4>
                <p>Issued on: 10 Jun, 2023</p>
              </div>
              <button className="btn-secondary">Download</button>
            </div>
            
            <div className="document-card">
              <div className="document-icon">🎓</div>
              <div className="document-info">
                <h4>Python Programming</h4>
                <p>Issued on: 15 Jul, 2023</p>
              </div>
              <button className="btn-secondary">Download</button>
            </div>
            
            <div className="document-card certificate-pending">
              <div className="document-icon">⏳</div>
              <div className="document-info">
                <h4>Data Science</h4>
                <p>Status: In Progress</p>
              </div>
              <button className="btn-disabled" disabled>Pending</button>
            </div>
          </div>
        </div>
        
        <div className="upload-section">
          <h3>Upload Documents</h3>
          <div className="upload-form">
            <div className="form-group">
              <label>Document Type</label>
              <select>
                <option>Select document type</option>
                <option>ID Proof</option>
                <option>Address Proof</option>
                <option>Previous Education Certificate</option>
              </select>
            </div>
            <div className="form-group">
              <label>Choose File</label>
              <input type="file" />
            </div>
            <button className="btn-primary">Upload</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDocuments;