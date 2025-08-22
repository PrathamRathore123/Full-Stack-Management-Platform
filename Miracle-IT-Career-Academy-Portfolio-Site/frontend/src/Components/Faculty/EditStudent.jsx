import React, { useState, useEffect } from 'react';
import { userAxiosInstance } from '../../api';
import './EditStudent.css';

const EditStudent = ({ student, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    enrollment_id: '',
    date_of_birth: '',
    admission_date: '',
    batch_id: '',
    course_id: ''
    // Removed password field as students will login with enrollment ID and DOB
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    // Initialize form with student data
    if (student) {
      setFormData({
        username: student.name || '',
        email: student.email || '',
        enrollment_id: student.enrollmentId || '',
        date_of_birth: student.dateOfBirth || '',
        admission_date: student.admissionDate || '',
        batch_id: student.batchId || '',
        course_id: student.courseId || ''
        // No password field as students will login with enrollment ID and DOB
      });
    }
    fetchCourses();
  }, [student]);

  useEffect(() => {
    if (formData.course_id) {
      fetchBatchesForCourse(formData.course_id);
    } else {
      setBatches([]);
    }
  }, [formData.course_id]);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await userAxiosInstance.get('courses/courses/');
      setCourses(response.data);
      setLoadingCourses(false);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setLoadingCourses(false);
    }
  };

  const fetchBatchesForCourse = async (courseId) => {
    try {
      const response = await userAxiosInstance.get(`batches/?course=${courseId}`);
      setBatches(response.data);
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Only include fields that have values and that have actually changed
      const updateData = {};
      if (formData.username && formData.username !== student.name) updateData.username = formData.username;
      if (formData.email && formData.email !== student.email) updateData.email = formData.email;
      if (formData.date_of_birth && formData.date_of_birth !== student.dateOfBirth) updateData.date_of_birth = formData.date_of_birth;
      
      // Always include admission_date in the update data if it exists in the form
      if (formData.admission_date) {
        console.log('Updating admission date:', formData.admission_date);
        updateData.admission_date = formData.admission_date;
      }
      
      // Convert batch_id and course_id to numbers if they exist and have changed
      if (formData.batch_id && parseInt(formData.batch_id) !== student.batchId) {
        updateData.batch_id = parseInt(formData.batch_id);
      }
      if (formData.course_id && parseInt(formData.course_id) !== student.courseId) {
        updateData.course_id = parseInt(formData.course_id);
      }

      // Only proceed if there are actual changes
      if (Object.keys(updateData).length === 0) {
        setLoading(false);
        onClose && onClose();
        return;
      }

      console.log('Updating student with data:', updateData);
      console.log('Student ID being updated:', student.id);
      
      // Use direct API call
      await userAxiosInstance.put(`students/${student.id}/`, updateData);
      setLoading(false);
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (err) {
      console.error('Student update error:', err);
      setLoading(false);
      setError(err.response?.data?.detail || err.message || 'Failed to update student account.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Student Account</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className='form-edit'>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Full Name</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="enrollment_id">Enrollment ID</label>
            <input
              type="text"
              id="enrollment_id"
              name="enrollment_id"
              value={formData.enrollment_id}
              onChange={handleChange}
              required
              readOnly
            />
          </div>

          <div className="form-group">
            <label htmlFor="date_of_birth">Date of Birth</label>
            <input
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="admission_date">Admission Date</label>
            <input
              type="date"
              id="admission_date"
              name="admission_date"
              value={formData.admission_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="course_id">Enroll in Course</label>
            <select
              id="course_id"
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              disabled={loadingCourses}
            >
              <option value="">-- Select a Course (Optional) --</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="batch_id">Select Batch</label>
            <select
              id="batch_id"
              name="batch_id"
              value={formData.batch_id}
              onChange={handleChange}
              disabled={!formData.course_id || batches.length === 0}
            >
              <option value="">-- Select a Batch (Optional) --</option>
              {batches.map(batch => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="login_info">Login Information</label>
            <div className="login-info-box">
              <p>Students can login using:</p>
              <ul>
                <li><strong>Username:</strong> Enrollment ID ({formData.enrollment_id})</li>
                <li><strong>Password:</strong> Date of Birth</li>
              </ul>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudent;