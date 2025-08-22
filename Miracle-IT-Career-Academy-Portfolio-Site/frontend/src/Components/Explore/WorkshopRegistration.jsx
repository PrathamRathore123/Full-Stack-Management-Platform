import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaChevronLeft, FaUser, FaEnvelope, FaPhone, FaGraduationCap } from 'react-icons/fa';
import './WorkshopRegistration.css';
import { fetchWorkshops, registerForWorkshop, userAxiosInstance } from '../../api';

const WorkshopRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    education: '',
    experience_level: 'beginner',
    special_requirements: ''
  });

  useEffect(() => {
    const fetchWorkshopData = async () => {
      try {
        const workshopsData = await fetchWorkshops();
        const foundWorkshop = workshopsData.find(w => w.id === parseInt(id));
        
        if (foundWorkshop) {
          setWorkshop(foundWorkshop);
        } else {
          setError("Workshop not found");
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching workshop details:', err);
        setError('Failed to load workshop details');
        setLoading(false);
      }
    };
    
    fetchWorkshopData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Add workshop ID to the form data
      const registrationData = {
        ...formData,
        workshop_id: parseInt(id),
        status: 'pending',
        workshop_title: workshop.title,
        created_at: new Date().toISOString()
      };

      // Send registration data to backend
      await registerForWorkshop(registrationData);
      
      setSuccess(true);
      setSubmitting(false);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate(`/explore/workshops/${id}`);
      }, 3000);
    } catch (err) {
      setSubmitting(false);
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
      console.error('Error registering for workshop:', err);
    }
  };

  if (loading) {
    return (
      <div className="workshop-registration-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading workshop details...</p>
        </div>
      </div>
    );
  }

  if (error && !workshop) {
    return (
      <div className="workshop-registration-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => navigate('/explore/workshops')}>Back to Workshops</button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="workshop-registration-container">
        <div className="registration-success">
          <div className="success-icon">✓</div>
          <h2>Registration Successful!</h2>
          <p>Thank you for registering for "{workshop.title}"</p>
          <p>We've sent a confirmation email with all the details.</p>
          <p className="redirect-message">Redirecting back to workshop details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="workshop-registration-container">
      <button onClick={() => navigate(`/explore/workshops/${id}`)} className="back-button">
        <FaChevronLeft /> Back to Workshop Details
      </button>
      
      <div className="registration-header">
        <h1>Register for Workshop</h1>
        <h2>{workshop.title}</h2>
        <p className="workshop-date">
          {new Date(workshop.date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
          {workshop.time && ` at ${workshop.time}`}
        </p>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
       
      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-group">
          <label htmlFor="name">
            <FaUser className="form-icon" /> Full Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">
            <FaEnvelope className="form-icon" /> Email Address*
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">
            <FaPhone className="form-icon" /> Phone Number*
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="education">
            <FaGraduationCap className="form-icon" /> Education Background
          </label>
          <input
            type="text"
            id="education"
            name="education"
            value={formData.education}
            onChange={handleChange}
            placeholder="Your highest education qualification"
          />
        </div>
        
        <div className="form-group">
          <label>Experience Level*</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="experience_level"
                value="beginner"
                checked={formData.experience_level === 'beginner'}
                onChange={handleChange}
              />
              Beginner
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="experience_level"
                value="intermediate"
                checked={formData.experience_level === 'intermediate'}
                onChange={handleChange}
              />
              Intermediate
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="experience_level"
                value="advanced"
                checked={formData.experience_level === 'advanced'}
                onChange={handleChange}
              />
              Advanced
            </label>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="special_requirements">Special Requirements</label>
          <textarea
            id="special_requirements"
            name="special_requirements"
            value={formData.special_requirements}
            onChange={handleChange}
            placeholder="Any special requirements or questions"
            rows="3"
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate(`/explore/workshops/${id}`)}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Complete Registration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkshopRegistration;