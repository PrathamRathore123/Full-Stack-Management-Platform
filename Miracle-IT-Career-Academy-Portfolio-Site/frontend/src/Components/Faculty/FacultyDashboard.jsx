import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { userAxiosInstance, fetchCourses, fetchWorkshops } from '../../api';
import './FacultyDashboard.css';
import { 
  FaBook, FaUsers, FaCalendarAlt, FaBullhorn, 
  FaPlus, FaChartLine, FaArrowRight, FaLayerGroup, 
  FaClipboardList, FaUserGraduate, FaRegClock, FaExclamationTriangle,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { 
  HiAcademicCap, HiChartBar, HiClock, HiCollection, 
  HiCube, HiLightningBolt, HiOutlineSparkles
} from 'react-icons/hi';

const FacultyDashboard = () => {
  const { user } = useContext(UserContext);
  const [dashboardData, setDashboardData] = useState({
    courses: [],
    students: [],
    announcements: [],
    upcomingWorkshops: [],
    batches: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    completionRate: 0,
    averageAttendance: 0,
    workshopsCount: 0
  });

  useEffect(() => {
    // Initialize carousel navigation
    const initCarousel = () => {
      const carousel = document.querySelector('.batches-carousel');
      const prevBtn = document.querySelector('.carousel-prev');
      const nextBtn = document.querySelector('.carousel-next');
      
      if (carousel && prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
          carousel.scrollBy({ left: -300, behavior: 'smooth' });
        });
        
        nextBtn.addEventListener('click', () => {
          carousel.scrollBy({ left: 300, behavior: 'smooth' });
        });
      }
    };
    
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Create an array of promises for parallel fetching
        const [dashboardResponse, studentsResponse, batchesResponse, coursesResponse, workshopsResponse] = await Promise.all([
          userAxiosInstance.get('dashboard/').catch(err => ({ data: { courses: [], recentActivities: [] } })),
          userAxiosInstance.get('students/').catch(err => ({ data: [] })),
          userAxiosInstance.get('batches/').catch(err => ({ data: [] })),
          fetchCourses().catch(err => []),
          fetchWorkshops().catch(err => [])
        ]);
        
        // Calculate statistics
        const students = studentsResponse.data || [];
        const activeStudents = students.filter(student => 
          student.status === 'Active' || !student.status
        ).length;
        
        // Calculate average attendance (placeholder - adjust based on your actual data structure)
        let totalAttendance = 0;
        let attendanceCount = 0;
        students.forEach(student => {
          if (student.attendance_percentage) {
            totalAttendance += parseFloat(student.attendance_percentage);
            attendanceCount++;
          }
        });
        
        const averageAttendance = attendanceCount > 0 
          ? (totalAttendance / attendanceCount).toFixed(1) 
          : 0;
        
        // Use courses from the courses API if available, otherwise fallback to dashboard data
        const courses = coursesResponse || [];
        const workshops = workshopsResponse || [];
        
        // Combine all data
        setDashboardData({
          courses: courses,
          students: students,
          announcements: [], // Set to empty array since endpoint doesn't exist
          upcomingWorkshops: workshops,
          batches: batchesResponse.data || [],
          recentActivities: dashboardResponse.data.recentActivities || []
        });
        
        setStats({
          totalStudents: students.length,
          activeStudents: activeStudents,
          completionRate: students.length > 0 ? 
            ((students.filter(s => s.completion_status === 'Completed').length / students.length) * 100).toFixed(1) : 0,
          averageAttendance: averageAttendance || 0,
          workshopsCount: workshops.length
        });
        
        setLoading(false);
        // Initialize carousel after data is loaded
        setTimeout(initCarousel, 100);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="faculty-dashboard-container">
        <div className="dashboard-content">
          <div className="loading">
            <div className="loading-spinner"></div>
            <span>Loading dashboard data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.username || 'Faculty'}</h1>
          <p>Here's an overview of your teaching activities and course management</p>
          <div className="header-actions">
            <div className="date-display">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon courses-icon">
              <HiCollection />
            </div>
            <div className="stat-details">
              <h3>{dashboardData.courses?.length || 0}</h3>
              <p>Active Courses</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon students-icon">
              <HiAcademicCap />
            </div>
            <div className="stat-details">
              <h3>{stats.totalStudents}</h3>
              <p>Enrolled Students</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon classes-icon">
              <HiCube />
            </div>
            <div className="stat-details">
              <h3>{dashboardData.batches?.length || 0}</h3>
              <p>Active Batches</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon announcements-icon">
              <HiClock />
            </div>
            <div className="stat-details">
              <h3>{stats.workshopsCount || 0}</h3>
              <p>Workshops</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon attendance-icon">
              <HiChartBar />
            </div>
            <div className="stat-details">
              <h3>{stats.averageAttendance || 0}%</h3>
              <p>Avg. Attendance</p>
            </div>
          </div>
        </div>

        <div className="dashboard-quick-actions">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            <Link to="/faculty/add-course" className="quick-action-card">
              <HiOutlineSparkles className="action-icon" />
              <span>Add New Course</span>
            </Link>
            <Link to="/faculty/add-workshop" className="quick-action-card">
              <HiCube className="action-icon" />
              <span>Add New Workshop</span>
            </Link>
            <Link to="/faculty/workshop-registrations" className="quick-action-card">
              <HiCollection className="action-icon" />
              <span>Workshop Registrations</span>
            </Link>
            <Link to="/faculty/attendance" className="quick-action-card">
              <HiClock className="action-icon" />
              <span>Take Attendance</span>
            </Link>
            <Link to="/faculty/gradebook" className="quick-action-card">
              <HiAcademicCap className="action-icon" />
              <span>Update Grades</span>
            </Link>
            <Link to="/faculty/fee-status" className="quick-action-card">
              <HiOutlineSparkles className="action-icon" />
              <span>Student Fee Status</span>
            </Link>
            <Link to="/faculty/announcements" className="quick-action-card">
              <HiLightningBolt className="action-icon" />
              <span>Post Announcement</span>
            </Link>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="dashboard-section">
            <div className="section-header">
              <h2><FaBook /> My Courses</h2>
              <Link to="/faculty/courses" className="view-all">
                View All <FaArrowRight />
              </Link>
            </div>
            <div className="courses-list">
              {dashboardData.courses && dashboardData.courses.length > 0 ? (
                <ul className="course-list-items">
                  {dashboardData.courses.map(course => (
                    <li className="course-list-item" key={course.id}>
                      <div className="course-list-image">
                        <img src={course.image || 'https://via.placeholder.com/280x160?text=Course'} alt={course.title} />
                      </div>
                      <div className="course-list-content">
                        <h3>{course.title}</h3>
                        <div className="course-list-meta">
                          <span className="course-students"><HiAcademicCap /> <span className="count-badge">{course.students_count !== undefined ? course.students_count : 0}</span> students</span>
                          <span className="course-level"><HiCollection /> <span className="level-badge">{course.level || 'All Levels'}</span></span>
                        </div>
                      </div>
                      <div className="course-list-actions">
                        <Link to={`/faculty/courses/${course.id}`} className="view-course-btn">Manage <FaArrowRight /></Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-data-message">
                  <FaExclamationTriangle />
                  <p>No courses available.</p>
                  <Link to="/faculty/add-course" className="create-link">Add a new course</Link>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-section batches-section">
            <div className="section-header">
              <h2><FaLayerGroup /> Active Batches</h2>
              <Link to="/faculty/batches" className="view-all">
                View All Batches <FaArrowRight />
              </Link>
            </div>
            <div className="batches-carousel-container">
              <button className="carousel-arrow carousel-prev">
                <FaChevronLeft />
              </button>
              <div className="batches-carousel">
                {dashboardData.batches && dashboardData.batches.length > 0 ? (
                  dashboardData.batches.map(batch => (
                    <div className="batch-card" key={batch.id}>
                      <div className="batch-details">
                        <h3>{batch.name}</h3>
                        <p>
                          <strong><FaBook /> Course:</strong> <span>{batch.course ? batch.course.title : 'Not assigned'}</span>
                        </p>
                        <p>
                          <strong><FaUsers /> Students:</strong> <span className="student-count"><FaUserGraduate /> {batch.students_count !== undefined ? batch.students_count : 0}</span>
                        </p>
                        <p>
                          <strong><FaRegClock /> Created:</strong> <span>{new Date(batch.created_at).toLocaleDateString()}</span>
                        </p>
                      </div>
                      <Link to={`/faculty/batches/${batch.id}`} className="view-batch-btn">Manage Batch <FaArrowRight /></Link>
                    </div>
                  ))
                ) : (
                  <div className="no-data-message">
                    <FaExclamationTriangle />
                    <p>No batches available.</p>
                    <Link to="/faculty/add-batch" className="create-link">Create a new batch</Link>
                  </div>
                )}
              </div>
              <button className="carousel-arrow carousel-next">
                <FaChevronRight />
              </button>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2><FaCalendarAlt /> Upcoming Workshops</h2>
              <Link to="/faculty/workshops" className="view-all">
                View All Workshops <FaArrowRight />
              </Link>
            </div>
            <div className="upcoming-classes">
              {dashboardData.upcomingWorkshops && dashboardData.upcomingWorkshops.length > 0 ? (
                dashboardData.upcomingWorkshops.map(workshop => {
                  const workshopDate = new Date(workshop.date);
                  const isUpcoming = workshopDate >= new Date();
                  
                  return (
                    <div className="class-card" key={workshop.id}>
                      <div className={`workshop-tag ${isUpcoming ? 'upcoming-tag' : 'past-tag'}`}>
                        {isUpcoming ? 'Upcoming' : 'Past'} {isUpcoming ? <HiLightningBolt /> : <HiClock />}
                      </div>
                      <div className="class-date">
                        <span className="date-day">{workshopDate.getDate()}</span>
                        <span className="date-month">{workshopDate.toLocaleString('default', { month: 'short' })}</span>
                      </div>
                      <div className="class-details">
                        <h3>{workshop.title}</h3>
                        <p>{workshop.location} • <span className="seats-badge"><FaUsers /> {workshop.available_seats ?? 0} seats available</span></p>
                      </div>
                      <div className="class-actions">
                        <Link to={`/faculty/workshops/${workshop.id}`} className="view-workshop-btn">View Details <FaArrowRight /></Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-data-message">
                  <FaExclamationTriangle />
                  <p>No upcoming workshops scheduled.</p>
                  <Link to="/faculty/add-workshop" className="create-link">Create a workshop</Link>
                </div>
              )}
            </div>
          </div>
          
          <div className="dashboard-section">
            <div className="section-header">
              <h2><FaChartLine /> Recent Student Activities</h2>
              <Link to="/faculty/students" className="view-all">
                View All Students <FaArrowRight />
              </Link>
            </div>
            <div className="activities-list">
              {dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
                dashboardData.recentActivities.map(activity => (
                  <div className="activity-card" key={activity.id}>
                    <div className="activity-time">
                      {new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="activity-details">
                      <h3>{activity.student_name}</h3>
                      <p>{activity.action}</p>
                      <p className="activity-course">{activity.course_title}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data-message">
                  <FaExclamationTriangle />
                  <p>No recent student activities.</p>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
};

export default FacultyDashboard;