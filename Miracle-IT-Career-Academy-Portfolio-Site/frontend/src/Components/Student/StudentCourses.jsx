import React, { useState, useEffect } from 'react';
import { userAxiosInstance } from '../../api';
import './StudentDashboard.css';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      // Get the enrolled courses for the current student
      const response = await userAxiosInstance.get('enrollments/');
      setCourses(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching enrolled courses:', err);
      setError('Failed to load your enrolled courses');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <h1>My Courses</h1>
        <div className="dashboard-content loading">
          <p>Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <h1>My Courses</h1>
        <div className="dashboard-content error">
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchEnrolledCourses}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1>My Courses</h1>
      <div className="dashboard-content">
        <p>View and manage your enrolled courses here.</p>
        
        {courses.length === 0 ? (
          <div className="no-courses-message">
            <h3>You are not enrolled in any courses yet</h3>
            <p>Contact your faculty or explore available courses to enroll</p>
          </div>
        ) : (
          <div className="courses-list">
            {courses.map(course => (
              <div className="course-card" key={course.id}>
                <div className="course-image">
                  {course.image_url ? (
                    <img src={course.image_url} alt={course.title} />
                  ) : (
                    <div className="placeholder-image">{course.title.charAt(0)}</div>
                  )}
                </div>
                <div className="course-info">
                  <h3>{course.title}</h3>
                  <p>{course.description || 'No description available'}</p>
                  <div className="course-meta">
                    <span className="course-level">{course.level}</span>
                    <span className="course-duration">{course.duration}</span>
                  </div>
                  <div className="course-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{course.progress || 0}% Complete</span>
                  </div>
                  <button className="btn-primary">Continue Learning</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCourses;