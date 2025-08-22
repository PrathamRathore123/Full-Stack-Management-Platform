import React from 'react';
import './AdminDashboard.css';
import './AttendanceLogs.css';

const AttendanceLogs = () => {
  return (
    <div className="dashboard-content">
      <h1>Attendance Logs</h1>
      <div className="attendance-filters">
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
          <label>Faculty:</label>
          <select className="filter-select">
            <option value="all">All Faculty</option>
            <option value="rajesh">Rajesh Kumar</option>
            <option value="anita">Anita Desai</option>
            <option value="vikram">Vikram Singh</option>
            <option value="priya">Priya Sharma</option>
            <option value="amit">Amit Kumar</option>
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
      
      <div className="attendance-summary">
        <div className="summary-card">
          <h3>Total Classes</h3>
          <p className="summary-number">248</p>
        </div>
        <div className="summary-card">
          <h3>Average Attendance</h3>
          <p className="summary-number">82%</p>
        </div>
        <div className="summary-card">
          <h3>Highest Attendance</h3>
          <p className="summary-number">95%</p>
          <p className="summary-detail">Web Development</p>
        </div>
        <div className="summary-card">
          <h3>Lowest Attendance</h3>
          <p className="summary-number">68%</p>
          <p className="summary-detail">Cloud Computing</p>
        </div>
      </div>
      
      <div className="attendance-table">
        <h3>Recent Attendance Records</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Course</th>
              <th>Faculty</th>
              <th>Total Students</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Attendance %</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>15 Jul, 2023</td>
              <td>Full Stack Web Development</td>
              <td>Rajesh Kumar</td>
              <td>45</td>
              <td>42</td>
              <td>3</td>
              <td className="attendance-good">93%</td>
              <td className="action-buttons">
                <button className="btn-icon">👁️</button>
                <button className="btn-icon">📊</button>
              </td>
            </tr>
            <tr>
              <td>15 Jul, 2023</td>
              <td>Python Programming</td>
              <td>Anita Desai</td>
              <td>38</td>
              <td>35</td>
              <td>3</td>
              <td className="attendance-good">92%</td>
              <td className="action-buttons">
                <button className="btn-icon">👁️</button>
                <button className="btn-icon">📊</button>
              </td>
            </tr>
            <tr>
              <td>14 Jul, 2023</td>
              <td>Data Science Fundamentals</td>
              <td>Vikram Singh</td>
              <td>32</td>
              <td>28</td>
              <td>4</td>
              <td className="attendance-good">88%</td>
              <td className="action-buttons">
                <button className="btn-icon">👁️</button>
                <button className="btn-icon">📊</button>
              </td>
            </tr>
            <tr>
              <td>14 Jul, 2023</td>
              <td>Machine Learning Basics</td>
              <td>Priya Sharma</td>
              <td>28</td>
              <td>22</td>
              <td>6</td>
              <td className="attendance-warning">79%</td>
              <td className="action-buttons">
                <button className="btn-icon">👁️</button>
                <button className="btn-icon">📊</button>
              </td>
            </tr>
            <tr>
              <td>13 Jul, 2023</td>
              <td>AWS Cloud Practitioner</td>
              <td>Amit Kumar</td>
              <td>22</td>
              <td>15</td>
              <td>7</td>
              <td className="attendance-poor">68%</td>
              <td className="action-buttons">
                <button className="btn-icon">👁️</button>
                <button className="btn-icon">📊</button>
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
  );
};

export default AttendanceLogs;