import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCourses } from '../../api';
import './CourseManagement.css';
import { UserContext } from '../UserContext';
import { FaEdit, FaList, FaPlus } from 'react-icons/fa';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin or faculty
    if (!user || (user.role !== 'admin' && user.role !== 'faculty')) {
      navigate('/login');
      return;
    }

    const loadCourses = async () => {
      try {
        setLoading(true);
        const data = await fetchCourses();
        setCourses(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load courses. Please try again.');
        setLoading(false);
        console.error('Error loading courses:', err);
      }
    };

    loadCourses();
  }, [user, navigate]);

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="course-management">
      <div className="management-header">
        <h1>Course Management</h1>
        {user && user.role === 'admin' && (
          <Link to="/admin/courses/new" className="add-course-button">
            <FaPlus /> Add New Course
          </Link>
        )}
      </div>

      <div className="courses-table-container">
        <table className="courses-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Level</th>
              <th>Duration</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length > 0 ? (
              courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.id}</td>
                  <td>{course.title}</td>
                  <td>{course.level}</td>
                  <td>{course.duration}</td>
                  <td>{new Date(course.last_updated).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <Link 
                      to={`/admin/courses/${course.id}/syllabus`} 
                      className="action-button syllabus-button"
                      title="Edit Syllabus"
                    >
                      <FaList />
                    </Link>
                    {user && user.role === 'admin' && (
                      <Link 
                        to={`/admin/courses/${course.id}/edit`} 
                        className="action-button edit-button"
                        title="Edit Course"
                      >
                        <FaEdit />
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-courses">No courses available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="management-info">
        <h2>Course Management Instructions</h2>
        <ul>
          <li><strong>Edit Syllabus:</strong> Both faculty and admin can edit course syllabuses</li>
          <li><strong>Edit Course:</strong> Only admin can edit course details</li>
          {user && user.role === 'admin' && (
            <li><strong>Add Course:</strong> Create new courses with the Add New Course button</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CourseManagement;