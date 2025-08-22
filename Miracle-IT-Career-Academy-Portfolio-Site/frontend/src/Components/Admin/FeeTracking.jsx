import React from 'react';
import './AdminDashboard.css';

const FeeTracking = () => {
  return (
    <div className="dashboard-container">
      <h1>Fee Tracking</h1>
      <div className="dashboard-content">
        <div className="fee-summary-cards">
          <div className="summary-card">
            <h3>Total Fees Collected</h3>
            <p className="summary-number">₹48.5L</p>
            <p className="summary-change positive">+12% from last quarter</p>
          </div>
          <div className="summary-card">
            <h3>Pending Fees</h3>
            <p className="summary-number">₹15.2L</p>
            <p className="summary-change negative">+5% from last quarter</p>
          </div>
          <div className="summary-card">
            <h3>Overdue Fees</h3>
            <p className="summary-number">₹8.7L</p>
            <p className="summary-change negative">+3% from last quarter</p>
          </div>
          <div className="summary-card">
            <h3>Collection Rate</h3>
            <p className="summary-number">76%</p>
            <p className="summary-change positive">+2% from last quarter</p>
          </div>
        </div>
        
        <div className="fee-filters">
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
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
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
        
        <div className="fee-chart">
          <h3>Fee Collection Trend</h3>
          <div className="chart-container">
            {/* Chart would be implemented with a library like Chart.js */}
            <div className="mock-chart">
              <div className="chart-bar" style={{ height: '60%', backgroundColor: '#4CAF50' }}>Jan</div>
              <div className="chart-bar" style={{ height: '75%', backgroundColor: '#4CAF50' }}>Feb</div>
              <div className="chart-bar" style={{ height: '65%', backgroundColor: '#4CAF50' }}>Mar</div>
              <div className="chart-bar" style={{ height: '80%', backgroundColor: '#4CAF50' }}>Apr</div>
              <div className="chart-bar" style={{ height: '70%', backgroundColor: '#4CAF50' }}>May</div>
              <div className="chart-bar" style={{ height: '85%', backgroundColor: '#4CAF50' }}>Jun</div>
              <div className="chart-bar" style={{ height: '90%', backgroundColor: '#4CAF50' }}>Jul</div>
            </div>
          </div>
        </div>
        
        <div className="fee-table">
          <h3>Recent Fee Transactions</h3>
          <table>
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Student Name</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Payment Date</th>
                <th>Payment Mode</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>REC-001</td>
                <td>John Smith</td>
                <td>Full Stack Web Development</td>
                <td>₹15,000</td>
                <td>15 Jul, 2023</td>
                <td>Online</td>
                <td className="status-success">Paid</td>
                <td className="action-buttons">
                  <button className="btn-icon">👁️</button>
                  <button className="btn-icon">🖨️</button>
                </td>
              </tr>
              <tr>
                <td>REC-002</td>
                <td>Priya Sharma</td>
                <td>Data Science Fundamentals</td>
                <td>₹18,000</td>
                <td>14 Jul, 2023</td>
                <td>Online</td>
                <td className="status-success">Paid</td>
                <td className="action-buttons">
                  <button className="btn-icon">👁️</button>
                  <button className="btn-icon">🖨️</button>
                </td>
              </tr>
              <tr>
                <td>REC-003</td>
                <td>Rajesh Kumar</td>
                <td>Python Programming</td>
                <td>₹12,000</td>
                <td>12 Jul, 2023</td>
                <td>Bank Transfer</td>
                <td className="status-success">Paid</td>
                <td className="action-buttons">
                  <button className="btn-icon">👁️</button>
                  <button className="btn-icon">🖨️</button>
                </td>
              </tr>
              <tr>
                <td>REC-004</td>
                <td>Anita Desai</td>
                <td>Machine Learning Basics</td>
                <td>₹20,000</td>
                <td>-</td>
                <td>-</td>
                <td className="status-pending">Pending</td>
                <td className="action-buttons">
                  <button className="btn-icon">👁️</button>
                  <button className="btn-icon">📧</button>
                </td>
              </tr>
              <tr>
                <td>REC-005</td>
                <td>Vikram Singh</td>
                <td>AWS Cloud Practitioner</td>
                <td>₹15,000</td>
                <td>-</td>
                <td>-</td>
                <td className="status-overdue">Overdue</td>
                <td className="action-buttons">
                  <button className="btn-icon">👁️</button>
                  <button className="btn-icon">📧</button>
                </td>
              </tr>
            </tbody>
          </table>
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

export default FeeTracking;