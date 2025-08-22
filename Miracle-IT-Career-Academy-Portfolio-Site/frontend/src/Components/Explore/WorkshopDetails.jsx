import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaRegClock, 
  FaChevronLeft, FaTag, FaCertificate, FaLaptopCode 
} from 'react-icons/fa';
import './WorkshopDetails.css';
import { fetchWorkshops } from '../../api';

const WorkshopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const getWorkshopDetails = async () => {
      try {
        setLoading(true);
        const workshopsData = await fetchWorkshops();
        
        // Find the workshop with the matching ID
        const foundWorkshop = workshopsData.find(w => w.id === parseInt(id));
        
        if (foundWorkshop) {
          setWorkshop(foundWorkshop);
        } else {
          setError('Workshop not found');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching workshop details:', err);
        setError('Failed to load workshop details');
        setLoading(false);
      }
    };
    
    getWorkshopDetails();
  }, [id]);
  
  if (loading) {
    return (
      <div className="workshop-details-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading workshop details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !workshop) {
    return (
      <div className="workshop-details-container">
        <div className="not-found">
          <h2>Workshop Not Found</h2>
          <p>The workshop you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/explore/workshops')} className="back-button">
            <FaChevronLeft /> Back to Workshops
          </button>
        </div>
      </div>
    );
  }

  // Check if workshop is past or upcoming
  const isPast = new Date(workshop.date) < new Date();
  
  return (
    <div className="workshop-details-container">
      <button onClick={() => navigate('/explore/workshops')} className="back-button">
        <FaChevronLeft /> Back to Workshops
      </button>
      
      <div className="workshop-details-header">
        <div className="workshop-details-image">
          <img 
            src={workshop.image || 'https://via.placeholder.com/800x400?text=Workshop'} 
            alt={workshop.title} 
          />
          {workshop.category && (
            <div className="workshop-details-badge">{workshop.category}</div>
          )}
          {isPast && (
            <div className="completed-badge">Completed</div>
          )}
        </div>
        
        <div className="workshop-details-info">
          <h1>{workshop.title}</h1>
          
          <div className="workshop-details-meta">
            <div className="meta-item">
              <FaCalendarAlt className="meta-icon" />
              <span>{new Date(workshop.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}</span>
            </div>
            
            {workshop.time && (
              <div className="meta-item">
                <FaRegClock className="meta-icon" />
                <span>{workshop.time}</span>
              </div>
            )}
            
            <div className="meta-item">
              <FaMapMarkerAlt className="meta-icon" />
              <span>{workshop.location}</span>
            </div>
            
            {!isPast && (
              <div className="meta-item">
                <FaUsers className="meta-icon" />
                <span>Available Seats: {workshop.available_seats || 'Limited'}</span>
              </div>
            )}
            
            {isPast && workshop.participants && (
              <div className="meta-item">
                <FaUsers className="meta-icon" />
                <span>{workshop.participants} Participants</span>
              </div>
            )}
            
            {workshop.category && (
              <div className="meta-item">
                <FaTag className="meta-icon" />
                <span>Category: {workshop.category}</span>
              </div>
            )}
          </div>
          
          {!isPast && (
            <button 
              className="register-button"
              onClick={() => navigate(`/explore/workshops/${workshop.id}/register`)}
            >
              Register Now
            </button>
          )}
        </div>
      </div>
      
      <div className="workshop-details-content">
        <div className="workshop-details-section">
          <h2>About This Workshop</h2>
          <p className="workshop-description">{workshop.description}</p>
        </div>
        
        <div className="workshop-details-section">
          <h2>What You'll Learn</h2>
          <div className="learning-outcomes">
            <div className="outcome-item">
              <div className="outcome-icon"><FaLaptopCode /></div>
              <div className="outcome-text">
                <h3>Hands-on Experience</h3>
                <p>Build real-world projects with guidance from industry experts</p>
              </div>
            </div>
            <div className="outcome-item">
              <div className="outcome-icon"><FaCertificate /></div>
              <div className="outcome-text">
                <h3>Certification</h3>
                <p>Earn a certificate of completion to showcase your new skills</p>
              </div>
            </div>
          </div>
        </div>
        
        {workshop.highlights && (
          <div className="workshop-details-section">
            <h2>Workshop Highlights</h2>
            <ul className="highlights-list">
              {workshop.highlights.map((highlight, index) => (
                <li key={index}><span className="highlight-bullet">•</span> {highlight}</li>
              ))}
            </ul>
          </div>
        )}
        
        {workshop.testimonial && (
          <div className="workshop-details-section">
            <h2>What Participants Say</h2>
            <div className="testimonial">
              <div className="quote-icon">❝</div>
              <blockquote>
                {workshop.testimonial.quote}
              </blockquote>
              <cite>- {workshop.testimonial.author}</cite>
            </div>
          </div>
        )}
        
        {workshop.gallery && workshop.gallery.length > 0 && (
          <div className="workshop-details-section">
            <h2>Gallery</h2>
            <div className="gallery">
              {workshop.gallery.map((img, index) => (
                <div className="gallery-item" key={index}>
                  <img src={img} alt={`Workshop moment ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="workshop-details-section">
          <h2>Ready to Join?</h2>
          <div className="cta-container">
            {!isPast ? (
              <button 
                className="register-button"
                onClick={() => navigate(`/explore/workshops/${workshop.id}/register`)}
              >
                Register for This Workshop
              </button>
            ) : (
              <div className="past-workshop-actions">
                <button className="materials-button">View Materials</button>
                <button className="recording-button">Watch Recording</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopDetails;