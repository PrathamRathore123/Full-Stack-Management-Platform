import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { createWorkshop } from '../../api';
import { FaInfoCircle, FaCalendarAlt, FaImage, FaChevronLeft } from 'react-icons/fa';
import './AddWorkshop.css';

const AddWorkshop = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    available_seats: '',
    category: '',
    target_audience: '',
    is_one_day: true,
    start_date: '',
    end_date: '',
    time: ''
  });
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is authorized and has valid token
  React.useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access');
      if (!token || !user || (user.role !== 'admin' && user.role !== 'faculty')) {
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
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
      // Validate required fields
      if (!formData.title || !formData.description || !formData.start_date || 
          !formData.location || !formData.available_seats || !image) {
        setError("Please fill all required fields");
        setLoading(false);
        return;
      }
      
      // Create FormData object to handle file upload
      const workshopData = new FormData();
      
      // Format the date field as expected by the backend
      let dateString = '';
      if (formData.is_one_day) {
        dateString = formData.start_date;
        if (formData.time) {
          dateString += ` (${formData.time})`;
        }
      } else {
        dateString = `${formData.start_date} to ${formData.end_date}`;
        if (formData.time) {
          dateString += ` (${formData.time})`;
        }
      }
      
      // Create a simplified object with only the fields the backend expects
      const simplifiedData = {
        title: formData.title,
        description: formData.description,
        date: dateString,
        location: formData.location,
        available_seats: Number(formData.available_seats),
        category: formData.category
      };
      
      // Add all form fields to FormData
      Object.keys(simplifiedData).forEach(key => {
        workshopData.append(key, simplifiedData[key]);
      });
      
      // Add image if selected
      if (image) {
        workshopData.append('image', image);
      }

      // Send request to create workshop using the API function
      const response = await createWorkshop(workshopData);

      setLoading(false);
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'faculty') {
        navigate('/faculty');
      }
    } catch (err) {
      setLoading(false);
      
      // More detailed error handling
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 401) {
          setError('Authentication error. Please log in again.');
          // Redirect to login after a short delay
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response.status === 400) {
          // Extract validation errors if available
          const errorData = err.response.data;
          console.log("Server validation errors:", errorData);
          
          if (typeof errorData === 'object' && errorData !== null) {
            let errorMessages = [];
            
            // Handle nested error objects
            for (const [field, errors] of Object.entries(errorData)) {
              if (Array.isArray(errors)) {
                errorMessages.push(`${field}: ${errors.join(', ')}`);
              } else if (typeof errors === 'object' && errors !== null) {
                // Handle nested objects
                for (const [nestedField, nestedErrors] of Object.entries(errors)) {
                  errorMessages.push(`${field}.${nestedField}: ${nestedErrors}`);
                }
              } else if (errors) {
                errorMessages.push(`${field}: ${errors}`);
              }
            }
            
            setError(`Validation error: ${errorMessages.join('; ')}`);
          } else if (typeof errorData === 'string') {
            setError(`Error: ${errorData}`);
          } else {
            setError('Invalid form data. Please check your inputs.');
          }
        } else {
          setError(err.response.data?.error || 'Failed to create workshop. Please try again.');
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request
        setError('Failed to create workshop. Please try again.');
      }
      
      console.error('Error creating workshop:', err);
    }
  };

  return (
    <div className="workshop-form-container">
      <div className="workshop-form-header">
        <h1>Create New Workshop</h1>
        <p>Fill in the details to create a new workshop event</p>
      </div>
      
      <div className="workshop-form-content">
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="workshop-form">
          <div className="form-section">
            <div className="section-title">
              <FaInfoCircle /> Basic Information
            </div>
            
            <div className="form-group">
              <label htmlFor="title">Workshop Title*</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter workshop title"
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
                placeholder="Describe what participants will learn in this workshop"
                rows="5"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select a category</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="react">React</option>
                  <option value="java">Java</option>
                  <option value="webdev">Web Development</option>
                  <option value="mobile">Mobile Development</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="target_audience">Target Audience</label>
                <input
                  type="text"
                  id="target_audience"
                  name="target_audience"
                  placeholder="e.g. Beginners, Intermediate Developers"
                  value={formData.target_audience}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <div className="section-title">
              <FaCalendarAlt /> Schedule Details
            </div>
            
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_one_day"
                  checked={formData.is_one_day}
                  onChange={handleChange}
                />
                One-day Workshop
              </label>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start_date">Start Date*</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {!formData.is_one_day && (
                <div className="form-group">
                  <label htmlFor="end_date">End Date</label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="time">Workshop Time</label>
                <input
                  type="text"
                  id="time"
                  name="time"
                  placeholder="e.g. 10:00 AM - 4:00 PM"
                  value={formData.time}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Location*</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  placeholder="e.g. Main Campus, Room 101"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="available_seats">Available Seats*</label>
              <input
                type="number"
                id="available_seats"
                name="available_seats"
                min="1"
                placeholder="Number of available seats"
                value={formData.available_seats}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-section">
            <div className="section-title">
              <FaImage /> Workshop Image
            </div>
            
            <div className="form-group image-upload">
              <label htmlFor="image">Upload Workshop Image*</label>
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
                  <img src={imagePreview} alt="Workshop preview" />
                </div>
              )}
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => {
                if (user.role === 'admin') {
                  navigate('/admin');
                } else if (user.role === 'faculty') {
                  navigate('/faculty');
                }
              }}
            >
              <FaChevronLeft /> Back
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Workshop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWorkshop;