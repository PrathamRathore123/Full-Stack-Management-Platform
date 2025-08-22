import React from 'react';
import './StudentDashboard.css';

const StudentPerformance = () => {
  return (
    <div className="dashboard-container">
      <h1>Performance Report</h1>
      <div className="dashboard-content">
        <p>View your academic performance across all courses.</p>
        <div className="performance-charts">
          <div className="chart-container">
            <h3>Overall Grade Distribution</h3>
            <div className="chart-placeholder">
              {/* Chart would be implemented with a library like Chart.js */}
              <div className="mock-chart">
                <div className="chart-bar" style={{ height: '80%', backgroundColor: '#4CAF50' }}>A</div>
                <div className="chart-bar" style={{ height: '60%', backgroundColor: '#2196F3' }}>B</div>
                <div className="chart-bar" style={{ height: '40%', backgroundColor: '#FFC107' }}>C</div>
                <div className="chart-bar" style={{ height: '20%', backgroundColor: '#F44336' }}>D</div>
              </div>
            </div>
          </div>
          <div className="performance-table">
            <h3>Course Performance</h3>
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Assignments</th>
                  <th>Quizzes</th>
                  <th>Projects</th>
                  <th>Final Grade</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Web Development</td>
                  <td>92%</td>
                  <td>88%</td>
                  <td>95%</td>
                  <td>A</td>
                </tr>
                <tr>
                  <td>Python Programming</td>
                  <td>85%</td>
                  <td>78%</td>
                  <td>90%</td>
                  <td>B+</td>
                </tr>
                <tr>
                  <td>Data Science</td>
                  <td>75%</td>
                  <td>82%</td>
                  <td>80%</td>
                  <td>B</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformance;