import React from 'react';
import './AdminDashboard.css';

const Certificates = () => {
  return (
    <div className="dashboard-container">
      <h1>Certificates</h1>
      <div className="dashboard-content">
        <div className="certificate-filters">
          <div className="filter-group">
            <label>Course:</label>
            <select className="filter-select">
              <option value="all">All Courses</option>
              <option value="web">Full Stack Web Development</option>
              <option value="python">Python Programming</option>
              <option value="data">Data Science Fundamentals</option>
              <option value="ml">Machine Learning Basics</option>
              <option value="aws">AWS Cloud Practitioner</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <select className="filter-select">
              <option value="all">All Status</option>
              <option value="issued">Issued</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Date Range:</label>
            <input type="date" className="date-input" />
            <span>to</span>
            <input type="date" className="date-input" />
          </div>
          <button className="btn-primary">Apply Filters</button>
        </div>
        
        <div className="certificate-summary">
          <div className="summary-card">
            <h3>Total Certificates</h3>
            <p className="summary-number">1,245</p>
          </div>
          <div className="summary-card">
            <h3>Issued</h3>
            <p className="summary-number">1,120</p>
            <p className="summary-percentage">90%</p>
          </div>
          <div className="summary-card">
            <h3>Pending</h3>
            <p className="summary-number">105</p>
            <p className="summary-percentage">8%</p>
          </div>
          <div className="summary-card">
            <h3>Rejected</h3>
            <p className="summary-number">20</p>
            <p className="summary-percentage">2%</p>
          </div>
        </div>
        
        <div className="certificate-table">
          <h3>Certificate Records</h3>
          <table>
            <thead>
              <tr>
                <th>Certificate ID</th>
                <th>Student Name</th>
                <th>Course</th>
                <th>Issue Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>CERT-001</td>
                <td>John Smith</td>
                <td>Full Stack Web Development</td>
                <td>15 Jun, 2023</td>
                <td>15 Jun, 2026</td>
                <td className="status-success">Issued</td>
                <td className="action-buttons">
                  <button className="btn-icon">👁️</button>
                  <button className="btn-icon">🖨️</button>
                  <button className="btn-icon">📧</button>
                </td>
              </tr>
              <tr>
                <td>CERT-002</td>
                <td>Priya Sharma</td>
                <td>Data Science Fundamentals</td>
                <td>10 Jun, 2023</td>
                <td>10 Jun, 2026</td>
                <td className="status-success">Issued</td>
                <td className="action-buttons">
                  <button className="btn-icon">👁️</button>
                  <button className="btn-icon">🖨️</button>
                  <button className="btn-icon">📧</button>
                </td>
              </tr>
              <tr>
                <td>CERT-003</td>
                <td>Rajesh Kumar</td>
                <td>Python Programming</td>
                <td>05 Jun, 2023</td>
                <td>05 Jun, 2026</td>
                <td className="status-success">Issued</td>
                <td className="action-buttons">
                  <button className="btn-icon">👁️</button>
                  <button className="btn-icon">🖨️</button>
                  <button className="btn-icon">📧</button>
                </td>
              </tr>
              <tr>
                <td>CERT-004</td>
                <td>Anita Desai</td>
                <td>Machine Learning Basics</td>
                <td>-</td>
                <td>-</td>
                <td className="status-pending">Pending</td>
                <td className="action-buttons">
                  <button className="btn-icon">👁️</button>
                  <button className="btn-icon">✅</button>
                  <button className="btn-icon">❌</button>
                </td>
              </tr>
              <tr>
                <td>CERT-005</td>
                <td>Vikram Singh</td>
                <td>AWS Cloud Practitioner</td>
                <td>-</td>
                <td>-</td>
                <td className="status-rejected">Rejected</td>
                <td className="action-buttons">
                  <button className="btn-icon">👁️</button>
                  <button className="btn-icon">✅</button>
                  <button className="btn-icon">📝</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="certificate-templates">
          <h3>Certificate Templates</h3>
          <div className="template-cards">
            <div className="template-card">
              <div className="template-preview">
                <img src="https://via.placeholder.com/150x100" alt="Certificate Template" />
              </div>
              <div className="template-info">
                <h4>Standard Certificate</h4>
                <p>Default template for all courses</p>
              </div>
              <div className="template-actions">
                <button className="btn-secondary">Edit</button>
                <button className="btn-secondary">Preview</button>
              </div>
            </div>
            <div className="template-card">
              <div className="template-preview">
                <img src="https://via.placeholder.com/150x100" alt="Certificate Template" />
              </div>
              <div className="template-info">
                <h4>Premium Certificate</h4>
                <p>For advanced courses</p>
              </div>
              <div className="template-actions">
                <button className="btn-secondary">Edit</button>
                <button className="btn-secondary">Preview</button>
              </div>
            </div>
            <div className="template-card">
              <div className="template-preview">
                <img src="https://via.placeholder.com/150x100" alt="Certificate Template" />
              </div>
              <div className="template-info">
                <h4>Special Achievement</h4>
                <p>For outstanding students</p>
              </div>
              <div className="template-actions">
                <button className="btn-secondary">Edit</button>
                <button className="btn-secondary">Preview</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pagination">
          <button className="pagination-btn">Previous</button>
          <button className="pagination-btn active">1</button>
          <button className="pagination-btn">2</button>
          <button className="pagination-btn">3</button>
          <button className="pagination-btn">Next</button>
        </div>
      </div>
    </div>
  );
};

export default Certificates;