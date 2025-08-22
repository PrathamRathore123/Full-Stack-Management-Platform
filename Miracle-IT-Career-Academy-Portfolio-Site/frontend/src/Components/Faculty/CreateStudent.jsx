import React, { useState, useEffect } from 'react';
import { createStudentAccount, userAxiosInstance } from '../../api';
import './CreateStudent.css';

const CreateStudent = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    enrollment_id: '',
    date_of_birth: '',
    course_id: '',
    batch_id: '',
    password: '' // No default password
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [nextEnrollmentId, setNextEnrollmentId] = useState(() => {
    const savedId = localStorage.getItem('lastEnrollmentId');
    if (savedId) {
      const currentNum = parseInt(savedId.replace('MIRA', ''));
      const nextNum = currentNum + 1;
      return `MIRA${nextNum.toString().padStart(4, '0')}`;
    }
    return 'MIRA0001';
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      enrollment_id: nextEnrollmentId
    }));
    fetchCourses();
  }, [nextEnrollmentId]);

  useEffect(() => {
    if (formData.course_id) {
      fetchBatchesForCourse(formData.course_id);
    } else {
      setBatches([]);
      setFormData(prev => ({ ...prev, batch_id: '' }));
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
      const response = await createStudentAccount(formData);
      const currentNum = parseInt(nextEnrollmentId.replace('MIRA', ''));
      const nextNum = currentNum + 1;
      const newEnrollmentId = `MIRA${nextNum.toString().padStart(4, '0')}`;
      localStorage.setItem('lastEnrollmentId', nextEnrollmentId);
      setNextEnrollmentId(newEnrollmentId);
      setLoading(false);
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (err) {
      console.error('Student creation error:', err);
      setLoading(false);
      setError(err.response?.data?.detail || err.message || 'Failed to create student account.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create Student Account</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="form-create">
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
            <small className="form-hint">Auto-generated unique ID</small>
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
            <small className="form-hint">
              Student will be automatically enrolled in this course
            </small>
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
            <small className="form-hint">
              Select the batch for the student
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password (Date of Birth)</label>
            <input
              type="text"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter date of birth as password"
            />
            <small className="form-hint">
              Student will use this password (DOB) to login
            </small>
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
              {loading ? 'Creating...' : 'Create Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStudent;