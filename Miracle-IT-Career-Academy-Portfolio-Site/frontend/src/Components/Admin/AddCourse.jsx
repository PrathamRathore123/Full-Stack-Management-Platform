import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { adminAxiosInstance } from '../../api';
import './AddCourse.css';

const AddCourse = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    level: 'Beginner',
    internship_duration: '',
    is_certified: false
  });
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is authorized
  React.useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'faculty')) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create FormData object to handle file upload
      const courseData = new FormData();
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        courseData.append(key, formData[key]);
      });
      
      // Add image if selected
      if (image) {
        courseData.append('image', image);
      }

      // Send request to create course
      const response = await adminAxiosInstance.post('/courses/create-course/', courseData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setLoading(false);
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin/courses');
      } else if (user.role === 'faculty') {
        navigate('/faculty/courses');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to create course. Please try again.');
      console.error('Error creating course:', err);
    }
  };

  return (
    <div className="add-course-container">
      <h1>Add New Course</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-group">
          <label htmlFor="title">Course Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description*</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            required
          />
        </div>
        
        <div className="form-group image-upload">
          <label htmlFor="image">Course Image*</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Course preview" />
            </div>
          )}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="duration">Duration*</label>
            <input
              type="text"
              id="duration"
              name="duration"
              placeholder="e.g. 8 weeks"
              value={formData.duration}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="level">Level*</label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              required
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="All Levels">All Levels</option>
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="internship_duration">Internship Duration</label>
            <input
              type="text"
              id="internship_duration"
              name="internship_duration"
              placeholder="e.g. 4 weeks"
              value={formData.internship_duration}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_certified"
                checked={formData.is_certified}
                onChange={handleChange}
              />
              Certification Available
            </label>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => {
              if (user.role === 'admin') {
                navigate('/admin/courses');
              } else if (user.role === 'faculty') {
                navigate('/faculty/courses');
              }
            }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCourse;