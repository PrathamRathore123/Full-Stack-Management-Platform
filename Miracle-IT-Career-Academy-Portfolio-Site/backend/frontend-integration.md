# Frontend Integration Guide

## Overview
This guide explains how to integrate the frontend with the new unified API endpoint.

## API Endpoints

### Public Access
The following endpoints are now publicly accessible without authentication:
- `/api/courses/courses/` - List all courses
- `/api/courses/videos/` - List all videos
- `/api/courses/quizzes/` - List all quizzes
- `/api/courses/syllabus/` - List all syllabus modules
- `/api/courses/syllabus-items/` - List all syllabus items
- `/api/dashboard/` - Get public data (courses, workshops, certificates, quizzes)

### Authenticated Access
When authenticated, the `/api/dashboard/` endpoint provides additional data:
- User profile information
- Course enrollments
- Notifications

## Frontend Integration Steps

### 1. Update API Service

```javascript
// api.js

// For public data (no authentication required)
export const fetchPublicData = async () => {
  try {
    const response = await axios.get('/api/dashboard/');
    return response.data;
  } catch (error) {
    console.error('Error fetching public data:', error);
    throw error;
  }
};

// For authenticated user data
export const fetchDashboardData = async () => {
  try {
    const response = await axios.get('/api/dashboard/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

// For actions that require authentication
export const performDashboardAction = async (action, data) => {
  try {
    const response = await axios.post('/api/dashboard/', 
      { action, ...data },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error performing ${action}:`, error);
    throw error;
  }
};
```

### 2. Example Usage in Components

#### Public Page (Courses List)
```jsx
import React, { useEffect, useState } from 'react';
import { fetchPublicData } from '../api';

const CoursesPage = () => {
  const [data, setData] = useState({
    courses: [],
    workshops: [],
    certificates: [],
    quizzes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchPublicData();
        setData(result);
      } catch (error) {
        console.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Courses</h1>
      <div className="courses-grid">
        {data.courses.map(course => (
          <div key={course.id} className="course-card">
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            {/* More course details */}
          </div>
        ))}
      </div>
      
      {/* Other sections for workshops, certificates, etc. */}
    </div>
  );
};

export default CoursesPage;
```

#### Dashboard (Authenticated User)
```jsx
import React, { useEffect, useState } from 'react';
import { fetchDashboardData, performDashboardAction } from '../api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const result = await fetchDashboardData();
        setData(result);
      } catch (error) {
        console.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboard();
  }, []);

  const handleEnrollCourse = async (courseId) => {
    try {
      await performDashboardAction('enroll_course', { course_id: courseId });
      // Refresh dashboard data
      const result = await fetchDashboardData();
      setData(result);
    } catch (error) {
      console.error('Failed to enroll in course');
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await performDashboardAction('mark_notification_read', { notification_id: notificationId });
      // Refresh dashboard data
      const result = await fetchDashboardData();
      setData(result);
    } catch (error) {
      console.error('Failed to mark notification as read');
    }
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (!data) return <div>Unable to load dashboard</div>;

  return (
    <div>
      <h1>Welcome, {data.user.username}</h1>
      
      {/* User Profile */}
      <section>
        <h2>Your Profile</h2>
        <p>Email: {data.user.email}</p>
        <p>Role: {data.user.role}</p>
        {/* Role-specific profile information */}
      </section>
      
      {/* Enrollments */}
      <section>
        <h2>Your Courses</h2>
        {data.enrollments.length > 0 ? (
          <div className="enrollments-grid">
            {data.enrollments.map(enrollment => (
              <div key={enrollment.id} className="enrollment-card">
                <h3>{enrollment.course.title}</h3>
                <p>Enrolled: {new Date(enrollment.enrolled_date).toLocaleDateString()}</p>
                {/* More enrollment details */}
              </div>
            ))}
          </div>
        ) : (
          <p>You are not enrolled in any courses yet.</p>
        )}
      </section>
      
      {/* Available Courses */}
      <section>
        <h2>Available Courses</h2>
        <div className="courses-grid">
          {data.courses.map(course => (
            <div key={course.id} className="course-card">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <button onClick={() => handleEnrollCourse(course.id)}>
                Enroll
              </button>
            </div>
          ))}
        </div>
      </section>
      
      {/* Notifications */}
      <section>
        <h2>Notifications</h2>
        {data.notifications.length > 0 ? (
          <div className="notifications-list">
            {data.notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification ${notification.is_read ? 'read' : 'unread'}`}
              >
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <p>Received: {new Date(notification.created_at).toLocaleString()}</p>
                {!notification.is_read && (
                  <button onClick={() => handleMarkNotificationRead(notification.id)}>
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No notifications.</p>
        )}
      </section>
      
      {/* Other sections for workshops, certificates, quizzes */}
    </div>
  );
};

export default Dashboard;
```

## Important Notes

1. The existing API endpoints still work as before, so you can gradually migrate to the new unified endpoint.

2. For public pages (not requiring authentication), use the `/api/dashboard/` endpoint without authentication to get courses, workshops, certificates, and quizzes.

3. For authenticated user pages, use the same endpoint with authentication to get additional user-specific data.

4. All actions (enrolling in courses, marking notifications as read) should be sent to the `/api/dashboard/` endpoint with the appropriate action parameter.

5. If you encounter any issues with the API, check the browser console for error messages and ensure you're sending the correct authentication headers for protected endpoints.