import React, { useContext, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../UserContext'
import './StudentDashboard.css'
import { FaSearch, FaBell, FaBook, FaCalendarCheck, FaMoneyBillWave } from 'react-icons/fa'
import { fetchCourseUpdateNotifications, getUserEnrollments, checkAttendanceStatus, getStudentFeeDetails } from '../../api'
import ChatWidget from '../Chatbot/ChatWidget'

export default function StudentDashboard() {
  const { user } = useContext(UserContext);
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState({ is_present: false });
  const [feeStatus, setFeeStatus] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch attendance status
        try {
          const attendanceData = await checkAttendanceStatus();
          setAttendanceStatus(attendanceData);
        } catch (err) {
          console.error('Error fetching attendance:', err);
          // Set default attendance status if fetch fails
          setAttendanceStatus({ is_present: false });
        }
        
        // Fetch fee status
        try {
          const feeData = await getStudentFeeDetails();
          console.log('Fee data received:', feeData); // Debug log
          setFeeStatus({
            total: feeData.total_amount,
            paid: feeData.amount_paid,
            due: feeData.due_amount,
            status: feeData.fee_details.status
          });
        } catch (err) {
          console.error('Error fetching fee details:', err);
          // Don't set default values, leave as null to indicate loading/error state
          setFeeStatus(null);
        }
        
        // Fetch enrollments
        try {
          const enrollmentsData = await getUserEnrollments();
          setEnrollments(enrollmentsData);
        } catch (err) {
          console.error('Error fetching enrollments:', err);
          setEnrollments([]);
        }
        
        // Set default values for notifications
        setNotifications([]);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  const handleCourseSearch = (e) => {
    setCourseSearchQuery(e.target.value);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (courseSearchQuery.trim()) {
      console.log('Searching for courses:', courseSearchQuery);
      // Implement course search functionality
    }
  };
  
  return (
    <div className="student-dashboard">
      <h1>Student Dashboard</h1>
      <div className="welcome-section">
        <h2>Welcome, {user?.username || 'Student'}!</h2>
        <p>Track your progress and access your courses from this dashboard.</p>
      </div>
      
      {/* Course search bar */}
      <div className="course-search-container">
        <form onSubmit={handleSearchSubmit}>
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search for courses..."
            value={courseSearchQuery}
            onChange={handleCourseSearch}
          />
        </form>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Enrolled Courses</h3>
          <p className="stat-number">{enrollments && enrollments.length || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Completed Assignments</h3>
          <p className="stat-number">15</p>
        </div>
        <div className="stat-card">
          <h3><FaCalendarCheck /> Attendance Status</h3>
          <p className="stat-number attendance-status">
            {attendanceStatus && attendanceStatus.is_present ? 'Present Today' : 'Not Marked'}
          </p>
        </div>
        <div className="stat-card">
          <h3><FaMoneyBillWave /> Fee Status</h3>
          {feeStatus ? (
            <div>
              <p className={`stat-number fee-status-${feeStatus.status}`}>
                {feeStatus.status === 'paid' ? 'Paid' : 
                 feeStatus.status === 'partially_paid' ? 'Partially Paid' : 'Unpaid'}
              </p>
              {feeStatus.due > 0 && (
                <p className="fee-due">Due: ₹{feeStatus.due.toLocaleString()}</p>
              )}
              <Link to="/student/fee-management" className="fee-status-link">
                View Details
              </Link>
            </div>
          ) : (
            <Link to="/student/fee-management" className="stat-number fee-status-link">
              View Details
            </Link>
          )}
        </div>
      </div>
      
      {/* Course Update Notifications */}
      <div className="course-notifications">
        <div className="section-header">
          <h3><FaBell /> Course Updates</h3>
          <Link to="/student/notifications" className="view-all-link">View All</Link>
        </div>
        
        <div className="notifications-preview">
          {loading ? (
            <p>Loading notifications...</p>
          ) : notifications.length > 0 ? (
            notifications.slice(0, 3).map(notification => (
              <div key={notification.id} className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}>
                <FaBook className="notification-icon" />
                <div className="notification-content">
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <span className="notification-time">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p>No course updates available.</p>
          )}
        </div>
      </div>
      
      <div className="my-courses">
        <h3>My Courses</h3>
        <div className="course-list">
          {loading ? (
            <p>Loading courses...</p>
          ) : enrollments.length > 0 ? (
            enrollments.map(enrollment => (
              <div className="course-card" key={enrollment.id}>
                <h4>{enrollment.course_title}</h4>
                <div className="progress-bar">
                  <div className="progress" style={{width: '50%'}}></div>
                </div>
                <p className="progress-text">50% Complete</p>
                <Link to={`/student/courses/${enrollment.course}`} className="continue-btn">
                  Continue
                </Link>
              </div>
            ))
          ) : (
            <p>You are not enrolled in any courses yet.</p>
          )}
        </div>
      </div>
      
      <ChatWidget />
    </div>
  )
}