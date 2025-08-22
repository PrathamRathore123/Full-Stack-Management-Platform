import React, { useState, useEffect } from 'react';
import './StudentAttendance.css';
import { userAxiosInstance } from '../../api';

const StudentAttendance = () => {
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('all');
  
  useEffect(() => {
    fetchAttendanceData();
  }, []);
  
  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const response = await userAxiosInstance.get('attendance/my_attendance/');
      console.log('Attendance data:', response.data);
      
      // Verify the data structure
      if (!response.data || !response.data.statistics) {
        console.error('Invalid attendance data structure:', response.data);
        return;
      }
      
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusClass = (percentage) => {
    if (percentage >= 85) return 'status-excellent';
    if (percentage >= 75) return 'status-good';
    if (percentage >= 60) return 'status-average';
    return 'status-poor';
  };
  
  const getStatusText = (percentage) => {
    if (percentage >= 85) return 'Excellent';
    if (percentage >= 75) return 'Good';
    if (percentage >= 60) return 'Average';
    return 'Poor';
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const filterAttendanceByMonth = (attendance) => {
    if (selectedMonth === 'all') return attendance;
    
    return attendance.filter(record => {
      const recordDate = new Date(record.date);
      const monthYear = recordDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      return monthYear === selectedMonth;
    });
  };
  
  const getAvailableMonths = () => {
    if (!attendanceData || !attendanceData.attendance) return [];
    
    const months = new Set();
    attendanceData.attendance.forEach(record => {
      const recordDate = new Date(record.date);
      const monthYear = recordDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.add(monthYear);
    });
    
    return Array.from(months);
  };
  
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="attendance-loading">
          <div className="loader"></div>
          <p>Loading attendance data...</p>
        </div>
      </div>
    );
  }
  
  if (!attendanceData) {
    return (
      <div className="dashboard-container">
        <div className="attendance-error">
          <i className="error-icon">⚠️</i>
          <p>Failed to load attendance data. Please try again later.</p>
          <button onClick={fetchAttendanceData} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }
  
  // Ensure we have valid data structures
  const attendance = attendanceData?.attendance || [];
  const filteredAttendance = filterAttendanceByMonth(attendance);
  const availableMonths = getAvailableMonths();
  const statistics = attendanceData?.statistics || {
    total_working_days: 0,
    present_days: 0,
    absent_days: 0,
    attendance_percentage: 0
  };
  
  // Debug output
  console.log('Statistics:', statistics);
  
  return (
    <div className="dashboard-container">
      <div className="attendance-header">
        <h1>Attendance Dashboard</h1>
        <div className="attendance-filters">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="month-filter"
          >
            <option value="all">All Months</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="attendance-cards">
        <div className="attendance-card" onClick={() => console.log('Working days:', statistics.total_working_days)}>
          <div className="card-icon working-days-icon">📅</div>
          <div className="card-content">
            <h3>Working Days</h3>
            <p className="card-value">{statistics.total_working_days || 0}</p>
          </div>
        </div>
        
        <div className="attendance-card">
          <div className="card-icon present-icon">✓</div>
          <div className="card-content">
            <h3>Present</h3>
            <p className="card-value">{statistics.present_days || 0}</p>
          </div>
        </div>
        
        <div className="attendance-card">
          <div className="card-icon absent-icon">✗</div>
          <div className="card-content">
            <h3>Absent</h3>
            <p className="card-value">{statistics.absent_days || 0}</p>
          </div>
        </div>
        
        <div className="attendance-card percentage-card">
          <div className={`card-icon percentage-icon ${getStatusClass(statistics.attendance_percentage || 0)}`}>%</div>
          <div className="card-content">
            <h3>Attendance</h3>
            <p className="card-value">{statistics.attendance_percentage || 0}%</p>
            <span className={`status-badge ${getStatusClass(statistics.attendance_percentage || 0)}`}>
              {getStatusText(statistics.attendance_percentage || 0)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="attendance-sections">
        <div className="attendance-section">
          <div className="section-header">
            <h2>Attendance History</h2>
            <span className="record-count">{filteredAttendance.length} records</span>
          </div>
          
          {filteredAttendance.length > 0 ? (
            <div className="attendance-table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map(record => (
                    <tr key={record.id}>
                      <td>{formatDate(record.date)}</td>
                      <td>{record.day_of_week}</td>
                      <td>
                        <span className={`status-pill ${record.is_present ? 'present-pill' : 'absent-pill'}`}>
                          {record.is_present ? 'Present' : 'Absent'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-records">
              <p>No attendance records found for the selected month.</p>
            </div>
          )}
        </div>
        
        {attendanceData.holidays && attendanceData.holidays.length > 0 && (
          <div className="attendance-section holidays-section">
            <div className="section-header">
              <h2>Holidays</h2>
              <span className="record-count">{attendanceData.holidays.length} holidays</span>
            </div>
            
            <div className="holidays-grid">
              {attendanceData.holidays.map((holiday, index) => (
                <div key={index} className="holiday-card">
                  <div className="holiday-date">{formatDate(holiday.date)}</div>
                  <div className="holiday-name">{holiday.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;