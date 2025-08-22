import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../UserContext';
import './AttendanceView.css';
import axios from 'axios';

const AttendanceView = () => {
  const { user } = useContext(UserContext);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [admissionDate, setAdmissionDate] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:8000/api/attendance/my_attendance/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setAttendanceData(response.data);
        if (response.data.admission_date) {
          setAdmissionDate(new Date(response.data.admission_date));
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setError('Failed to load attendance data');
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  if (loading) return <div className="attendance-loading">Loading attendance data...</div>;
  if (error) return <div className="attendance-error">{error}</div>;
  
  // Handle case when no attendance data is available
  const noData = !attendanceData || !attendanceData.statistics || attendanceData.statistics.total_days === 0;

  return (
    <div className="attendance-container">
      <h2>My Attendance</h2>
      
      {noData ? (
        <div className="attendance-empty">
          <p>No attendance records found. Your attendance will be automatically marked when you log in each day.</p>
        </div>
      ) : (
        <>
          <div className="attendance-stats">
            <div className="stat-card">
              <h3>Total Days</h3>
              <p className="stat-number">{attendanceData.statistics.total_days}</p>
            </div>
            <div className="stat-card">
              <h3>Present Days</h3>
              <p className="stat-number">{attendanceData.statistics.present_days}</p>
            </div>
            <div className="stat-card">
              <h3>Attendance Percentage</h3>
              <p className="stat-number">{attendanceData.statistics.attendance_percentage}%</p>
            </div>
            {admissionDate && (
              <div className="stat-card">
                <h3>Admission Date</h3>
                <p className="stat-number">{admissionDate.toLocaleDateString()}</p>
              </div>
            )}
          </div>

          <div className="attendance-history">
            <h3>Attendance History</h3>
            {attendanceData.attendance && attendanceData.attendance.length > 0 ? (
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Login Time</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.attendance.map(record => (
                    <tr key={record.id} className={record.is_present ? 'present' : 'absent'}>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>{record.is_present ? 'Present' : 'Absent'}</td>
                      <td>{new Date(record.login_time).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No attendance records available.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceView;