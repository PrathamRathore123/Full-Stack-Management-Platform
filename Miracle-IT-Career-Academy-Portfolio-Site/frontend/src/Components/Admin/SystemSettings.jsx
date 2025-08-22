import React from 'react';
import './AdminDashboard.css';

const SystemSettings = () => {
  return (
    <div className="dashboard-container">
      <h1>System Settings</h1>
      <div className="dashboard-content">
        <div className="settings-tabs">
          <button className="tab-btn active">General</button>
          <button className="tab-btn">Email</button>
          <button className="tab-btn">Security</button>
          <button className="tab-btn">Appearance</button>
          <button className="tab-btn">Integrations</button>
          <button className="tab-btn">Backup</button>
        </div>
        
        <div className="settings-section">
          <h3>General Settings</h3>
          <div className="settings-form">
            <div className="form-group">
              <label>Institution Name</label>
              <input type="text" value="Miracle Learning Center" className="form-control" />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea className="form-control">123 Education Street, Knowledge City, 560001</textarea>
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input type="email" value="info@miraclelearning.com" className="form-control" />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input type="text" value="+91 9876543210" className="form-control" />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input type="url" value="https://www.miraclelearning.com" className="form-control" />
            </div>
            <div className="form-group">
              <label>Academic Year</label>
              <select className="form-control">
                <option>2023-2024</option>
                <option>2022-2023</option>
                <option>2021-2022</option>
              </select>
            </div>
            <div className="form-group">
              <label>Time Zone</label>
              <select className="form-control">
                <option>(GMT+05:30) India Standard Time</option>
                <option>(GMT+00:00) Greenwich Mean Time</option>
                <option>(GMT-05:00) Eastern Time</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date Format</label>
              <select className="form-control">
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
            <div className="form-group">
              <label>Currency</label>
              <select className="form-control">
                <option>INR (₹)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
              </select>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>System Maintenance</h3>
            <div className="maintenance-options">
              <div className="maintenance-option">
                <h4>Database Backup</h4>
                <p>Last backup: 15 Jul, 2023 03:45 AM</p>
                <button className="btn-primary">Backup Now</button>
              </div>
              <div className="maintenance-option">
                <h4>System Cache</h4>
                <p>Clear system cache to improve performance</p>
                <button className="btn-primary">Clear Cache</button>
              </div>
              <div className="maintenance-option">
                <h4>System Logs</h4>
                <p>View and download system logs</p>
                <button className="btn-primary">View Logs</button>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button className="btn-primary">Save Changes</button>
            <button className="btn-secondary">Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;