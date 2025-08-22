import React from 'react';
import './FacultyDashboard.css';

const Gradebook = () => {
  return (
    <div className="dashboard-container">
      <h1>Gradebook</h1>
      <div className="dashboard-content">
        <div className="gradebook-filters">
          <div className="filter-group">
            <label>Course:</label>
            <select className="filter-select">
              <option value="web">Web Development</option>
              <option value="python">Python Programming</option>
              <option value="data">Data Science Fundamentals</option>
              <option value="ml">Machine Learning Basics</option>
              <option value="js">JavaScript Fundamentals</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Assessment Type:</label>
            <select className="filter-select">
              <option value="all">All Types</option>
              <option value="assignments">Assignments</option>
              <option value="quizzes">Quizzes</option>
              <option value="projects">Projects</option>
              <option value="exams">Exams</option>
            </select>
          </div>
          <button className="btn-primary">Load</button>
        </div>
        
        <div className="grade-summary">
          <div className="summary-card">
            <h3>Class Average</h3>
            <p className="summary-number">82%</p>
            <p className="summary-grade">B</p>
          </div>
          <div className="summary-card">
            <h3>Highest Grade</h3>
            <p className="summary-number">95%</p>
            <p className="summary-grade">A+</p>
          </div>
          <div className="summary-card">
            <h3>Lowest Grade</h3>
            <p className="summary-number">68%</p>
            <p className="summary-grade">C</p>
          </div>
          <div className="summary-card">
            <h3>Submissions</h3>
            <p className="summary-number">42/45</p>
            <p className="summary-percentage">93%</p>
          </div>
        </div>
        
        <div className="gradebook-actions">
          <button className="btn-primary">Add Assessment</button>
          <button className="btn-secondary">Import Grades</button>
          <button className="btn-secondary">Export Grades</button>
          <button className="btn-secondary">Grade Distribution</button>
        </div>
        
        <div className="gradebook-table">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Assignment 1 (10%)</th>
                <th>Quiz 1 (5%)</th>
                <th>Assignment 2 (15%)</th>
                <th>Midterm (25%)</th>
                <th>Project (20%)</th>
                <th>Final Exam (25%)</th>
                <th>Overall</th>
                <th>Grade</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>John Smith</td>
                <td><input type="text" value="85" className="grade-input" /></td>
                <td><input type="text" value="90" className="grade-input" /></td>
                <td><input type="text" value="88" className="grade-input" /></td>
                <td><input type="text" value="92" className="grade-input" /></td>
                <td><input type="text" value="95" className="grade-input" /></td>
                <td><input type="text" value="90" className="grade-input" /></td>
                <td className="grade-good">90%</td>
                <td className="grade-good">A</td>
                <td className="action-buttons">
                  <button className="btn-icon">📊</button>
                  <button className="btn-icon">📝</button>
                </td>
              </tr>
              <tr>
                <td>Priya Sharma</td>
                <td><input type="text" value="82" className="grade-input" /></td>
                <td><input type="text" value="85" className="grade-input" /></td>
                <td><input type="text" value="80" className="grade-input" /></td>
                <td><input type="text" value="88" className="grade-input" /></td>
                <td><input type="text" value="90" className="grade-input" /></td>
                <td><input type="text" value="85" className="grade-input" /></td>
                <td className="grade-good">85%</td>
                <td className="grade-good">B+</td>
                <td className="action-buttons">
                  <button className="btn-icon">📊</button>
                  <button className="btn-icon">📝</button>
                </td>
              </tr>
              <tr>
                <td>Rajesh Kumar</td>
                <td><input type="text" value="78" className="grade-input" /></td>
                <td><input type="text" value="80" className="grade-input" /></td>
                <td><input type="text" value="75" className="grade-input" /></td>
                <td><input type="text" value="82" className="grade-input" /></td>
                <td><input type="text" value="85" className="grade-input" /></td>
                <td><input type="text" value="80" className="grade-input" /></td>
                <td className="grade-good">80%</td>
                <td className="grade-good">B</td>
                <td className="action-buttons">
                  <button className="btn-icon">📊</button>
                  <button className="btn-icon">📝</button>
                </td>
              </tr>
              <tr>
                <td>Anita Desai</td>
                <td><input type="text" value="70" className="grade-input" /></td>
                <td><input type="text" value="75" className="grade-input" /></td>
                <td><input type="text" value="72" className="grade-input" /></td>
                <td><input type="text" value="78" className="grade-input" /></td>
                <td><input type="text" value="80" className="grade-input" /></td>
                <td><input type="text" value="75" className="grade-input" /></td>
                <td className="grade-average">75%</td>
                <td className="grade-average">C+</td>
                <td className="action-buttons">
                  <button className="btn-icon">📊</button>
                  <button className="btn-icon">📝</button>
                </td>
              </tr>
              <tr>
                <td>Vikram Singh</td>
                <td><input type="text" value="65" className="grade-input" /></td>
                <td><input type="text" value="70" className="grade-input" /></td>
                <td><input type="text" value="68" className="grade-input" /></td>
                <td><input type="text" value="72" className="grade-input" /></td>
                <td><input type="text" value="75" className="grade-input" /></td>
                <td><input type="text" value="70" className="grade-input" /></td>
                <td className="grade-warning">70%</td>
                <td className="grade-warning">C</td>
                <td className="action-buttons">
                  <button className="btn-icon">📊</button>
                  <button className="btn-icon">📝</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="grade-distribution">
          <h3>Grade Distribution</h3>
          <div className="distribution-chart">
            {/* Chart would be implemented with a library like Chart.js */}
            <div className="mock-chart">
              <div className="chart-bar" style={{ height: '20%', backgroundColor: '#4CAF50' }}>A+</div>
              <div className="chart-bar" style={{ height: '35%', backgroundColor: '#8BC34A' }}>A</div>
              <div className="chart-bar" style={{ height: '25%', backgroundColor: '#CDDC39' }}>B+</div>
              <div className="chart-bar" style={{ height: '15%', backgroundColor: '#FFC107' }}>B</div>
              <div className="chart-bar" style={{ height: '5%', backgroundColor: '#FF9800' }}>C+</div>
              <div className="chart-bar" style={{ height: '0%', backgroundColor: '#F44336' }}>C</div>
            </div>
          </div>
        </div>
        
        <div className="gradebook-save">
          <button className="btn-primary">Save Grades</button>
          <button className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default Gradebook;