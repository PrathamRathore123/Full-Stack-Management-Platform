import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  fetchCourseById, 
  fetchVideosByCourseId, 
  fetchCourseSyllabus,
  enrollInCourse,
  getUserEnrollments,
  createPaymentOrder,
  verifyPayment,
  checkEnrollmentStatus,
  submitCourseEnquiry
} from '../../api';
import './CourseDetail.css';
import { FaClock, FaBriefcase, FaCertificate, FaBook, FaChevronDown, FaChevronUp, FaLock } from 'react-icons/fa';
import { UserContext } from '../UserContext';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [syllabus, setSyllabus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [openModules, setOpenModules] = useState({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [enquiryData, setEnquiryData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const videoRef = useRef(null);
  const previewTimerRef = useRef(null);

  useEffect(() => {
    const getCourseDetails = async () => {
      try {
        setLoading(true);
        const courseData = await fetchCourseById(courseId);
        setCourse(courseData);
        
        // Set preview video - use first video from playlist or explicit preview URL
        let preview = null;
        if (courseData.preview_video) {
          preview = courseData.preview_video;
        } else if (courseData.preview_video_url) {
          preview = {
            id: 'preview',
            title: `${courseData.title} - Preview`,
            url: courseData.preview_video_url,
            source_type: courseData.preview_video_url.includes('youtube') ? 'youtube' : 'direct',
            order: -1,
            preview_duration: courseData.preview_duration || 300
          };
        }
        
        if (preview) {
          setPreviewVideo(preview);
          setSelectedVideo(preview);
        }
        
        try {
          const videosData = await fetchVideosByCourseId(courseId);
          setVideos(videosData);
          
          // If no explicit preview is set, use first video as preview
          if (!preview && videosData.length > 0) {
            const firstVideo = videosData.find(v => v.order === 0) || videosData[0];
            const firstVideoPreview = {
              id: 'preview',
              title: `${courseData.title} - Preview`,
              url: firstVideo.url,
              source_type: firstVideo.source_type || (firstVideo.url.includes('youtube') ? 'youtube' : 'direct'),
              order: -1,
              preview_duration: courseData.preview_duration || 300
            };
            setPreviewVideo(firstVideoPreview);
            setSelectedVideo(firstVideoPreview);
          }
        } catch (videoErr) {
          console.error('Error loading videos:', videoErr);
          setVideoError('Failed to load videos');
        }
        
        const syllabusData = await fetchCourseSyllabus(courseId);
        setSyllabus(syllabusData);
        
        // Initialize first module as open
        if (syllabusData.length > 0) {
          setOpenModules({ [syllabusData[0].id]: true });
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load course details. Please try again later.');
        setLoading(false);
        console.error('Error fetching course details:', err);
      }
    };

    if (courseId) {
      getCourseDetails();
    }
  }, [courseId]);

  useEffect(() => {
    const checkUserEnrollmentStatus = async () => {
      if (user) {
        try {
          const response = await checkEnrollmentStatus(courseId);
          setIsEnrolled(response.is_enrolled);
        } catch (err) {
          console.error('Error checking enrollment status:', err);
          // Fallback to old method if the new endpoint fails
          try {
            const enrollments = await getUserEnrollments();
            const enrolled = enrollments.some(enrollment => enrollment.course === parseInt(courseId));
            setIsEnrolled(enrolled);
          } catch (fallbackErr) {
            console.error('Error with fallback enrollment check:', fallbackErr);
          }
        }
      }
    };

    checkUserEnrollmentStatus();
  }, [courseId, user]);

  // Start preview timer for preview video only
  useEffect(() => {
    if (selectedVideo && !isEnrolled && selectedVideo.id === 'preview' && selectedVideo.preview_duration) {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }
      
      previewTimerRef.current = setTimeout(() => {
        setShowPaymentPrompt(true);
      }, selectedVideo.preview_duration * 1000);
    }
    
    return () => {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }
    };
  }, [selectedVideo, isEnrolled]);

  const handleVideoSelect = (video) => {
    console.log('Video selected:', video);
    
    // Validate video before selection
    if (!video || !video.url) {
      console.error('Invalid video selected:', video);
      return;
    }
    
    // For non-enrolled users, allow first video (order 0) as preview, lock others
    if (!isEnrolled && video.order !== 0) {
      console.log('Video locked, showing payment prompt');
      setShowPaymentPrompt(true);
      return;
    }
    
    // Clear existing preview timer
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
    }
    
    // If non-enrolled user selects first video, convert it to preview mode
    if (!isEnrolled && video.order === 0) {
      const previewVideo = {
        ...video,
        id: 'preview',
        title: `${course.title} - Preview`,
        order: -1,
        preview_duration: course.preview_duration || 300
      };
      setSelectedVideo(previewVideo);
    } else {
      setSelectedVideo(video);
    }
    
    setVideoTime(0);
    setShowPaymentPrompt(false);
  };
  
  // Handle video time update to enforce preview limits
  const handleTimeUpdate = (e) => {
    if (!isEnrolled && selectedVideo && (selectedVideo.id === 'preview' || selectedVideo.order === 0)) {
      const currentTime = e.target.currentTime;
      setVideoTime(currentTime);
      
      // Check if preview time limit is reached
      const previewDuration = selectedVideo.preview_duration || 300;
      if (currentTime >= previewDuration) {
        if (videoRef.current) {
          videoRef.current.pause();
          setShowPaymentPrompt(true);
        }
      }
    }
  };

  const toggleModule = (moduleId) => {
    setOpenModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleEnroll = async () => {
    if (!user) {
      // Redirect to login or show login modal
      alert('Please log in to enroll in this course');
      return;
    }

    try {
      setEnrolling(true);
      
      // Check if course has a price
      if (course.price > 0) {
        // Show payment form
        initiatePayment();
      } else {
        // Free course, direct enrollment
        await enrollInCourse(courseId);
        setIsEnrolled(true);
      }
    } catch (err) {
      console.error('Error enrolling in course:', err);
      setEnrolling(false);
      
      // Check if payment required error
      if (err.response && err.response.status === 402) {
        initiatePayment();
      }
    }
  };
  
  const initiatePayment = async () => {
    try {
      setPaymentProcessing(true);
      setPaymentError(null);
      
      // Create order on server
      const orderData = await createPaymentOrder(courseId);
      
      // Initialize Razorpay
      const options = {
        key: 'rzp_test_your_key_id', // Replace with your actual key
        amount: orderData.amount * 100, // Amount in paisa
        currency: orderData.currency,
        name: 'Course Enrollment',
        description: `Enrollment for ${course.title}`,
        order_id: orderData.order_id,
        handler: function(response) {
          // Handle successful payment
          handlePaymentSuccess(response, orderData.order_id);
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: function() {
            setPaymentProcessing(false);
            setEnrolling(false);
          }
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (err) {
      console.error('Payment initiation error:', err);
      setPaymentError('Failed to initiate payment. Please try again.');
      setPaymentProcessing(false);
      setEnrolling(false);
    }
  };
  
  const handlePaymentSuccess = async (response, orderId) => {
    try {
      // Verify payment on server
      await verifyPayment({
        payment_id: response.razorpay_payment_id,
        order_id: response.razorpay_order_id,
        signature: response.razorpay_signature,
        course_id: courseId
      });
      
      // Update enrollment status
      setIsEnrolled(true);
      setPaymentProcessing(false);
      setEnrolling(false);
      setShowPaymentPrompt(false);
      
      // Show success message
      alert('Payment successful! You are now enrolled in this course.');
      
    } catch (err) {
      console.error('Payment verification error:', err);
      setPaymentError('Payment verification failed. Please contact support.');
      setPaymentProcessing(false);
      setEnrolling(false);
    }
  };
  
  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Add course ID to enquiry data
      const enquiryPayload = {
        ...enquiryData,
        course: courseId
      };
      
      // Submit enquiry
      await submitCourseEnquiry(enquiryPayload);
      
      // Reset form and show success message
      setEnquiryData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
      
      setShowEnquiryForm(false);
      alert('Enquiry submitted successfully! Our team will contact you shortly.');
      
    } catch (err) {
      console.error('Error submitting enquiry:', err);
      alert('Failed to submit enquiry. Please try again.');
    }
  };
  
  const handleEnquiryChange = (e) => {
    const { name, value } = e.target;
    setEnquiryData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div className="loading">Loading course details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!course) {
    return <div className="error-message">Course not found</div>;
  }

  return (
    <div className="course-detail-container">
      <div className="course-header">
        <h1>{course.title}</h1>
        <div className="course-meta">
          <span className="course-level">{course.level}</span>
          <span className="course-duration">{course.duration}</span>
        </div>
      </div>

      <div className="course-description">
        <h2>About this Course</h2>
        <p>{course.description}</p>
      </div>

      <div className="course-features">
        <div className="feature-card">
          <h3><FaClock /> Course Duration</h3>
          <p>{course.duration}</p>
        </div>
        <div className="feature-card">
          <h3><FaBriefcase /> Internship</h3>
          <p>{course.internship_duration || 'No internship included'}</p>
        </div>
        <div className="feature-card">
          <h3><FaCertificate /> Certification</h3>
          <p>{course.is_certified ? 'Certified Course' : 'No certification'}</p>
        </div>
      </div>

      {syllabus.length > 0 && (
        <div className="course-syllabus">
          <h2><FaBook /> Course Syllabus</h2>
          <div className="syllabus-grid">
            {syllabus.map((module) => (
              <div className="syllabus-card" key={module.id}>
                <div className="card-header" onClick={() => toggleModule(module.id)}>
                  <div className="module-info">
                    <span className="module-number">{module.order}</span>
                    <h3>{module.title}</h3>
                  </div>
                  {openModules[module.id] ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {openModules[module.id] && (
                  <div className="card-content">
                    {module.items.map((item) => (
                      <div className="syllabus-item" key={item.id}>
                        <h4>{item.title}</h4>
                        {item.description && <p>{item.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="video-section">
        <div className="video-main">
          <div className="video-player-container">
            {videoError ? (
              <div className="video-error">
                <p>⚠️ {videoError}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
              </div>
            ) : selectedVideo ? (
              <div className="video-player">
                {showPaymentPrompt && !isEnrolled ? (
                  <div className="payment-overlay">
                    <div className="payment-content">
                      <h3>🔒 Enroll to Continue</h3>
                      <p>Unlock all course content with enrollment</p>
                      {course.price > 0 ? (
                        <div className="pricing">
                          <div className="price">
                            {course.discount_price ? (
                              <>
                                <span className="original">₹{course.price}</span>
                                <span className="discounted">₹{course.discount_price}</span>
                              </>
                            ) : (
                              <span className="current">₹{course.price}</span>
                            )}
                          </div>
                          <button className="enroll-btn" onClick={handleEnroll} disabled={enrolling}>
                            {enrolling ? 'Processing...' : 'Enroll Now'}
                          </button>
                        </div>
                      ) : (
                        <button className="enroll-btn free" onClick={handleEnroll} disabled={enrolling}>
                          {enrolling ? 'Enrolling...' : 'Enroll for Free'}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="video-wrapper">
                    <div className="debug-info" style={{position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '5px', fontSize: '12px', zIndex: 100}}>
                      URL: {selectedVideo.url}<br/>
                      Type: {selectedVideo.source_type}<br/>
                      Order: {selectedVideo.order}
                    </div>
                    {selectedVideo.source_type === 'youtube' ? (
                      <iframe
                        src={selectedVideo.url}
                        title={selectedVideo.title}
                        width="100%"
                        height="100%"
                        allowFullScreen
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      ></iframe>
                    ) : (
                      <video
                        ref={videoRef}
                        src={selectedVideo.url}
                        controls
                        width="100%"
                        height="100%"
                        onTimeUpdate={handleTimeUpdate}
                      />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="no-video-selected">
                <div className="placeholder">
                  <h3>Select a video to start learning</h3>
                  <p>Choose from the playlist to begin your course</p>
                </div>
              </div>
            )}
          </div>
          
          {selectedVideo && (
            <div className="video-details">
              <h2 className="video-title">{selectedVideo.title}</h2>
              <div className="video-meta">
                {selectedVideo.id === 'preview' ? (
                  <span className="preview-tag">🎬 Free Preview</span>
                ) : (
                  <span className="lesson-number">Lesson {selectedVideo.order + 1}</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="playlist-sidebar">
          <div className="playlist-header">
            <h3>Course Content</h3>
            <span className="video-count">{videos.length} lessons</span>
          </div>
          
          <div className="playlist-container">
            {videos.length > 0 ? (
              videos.map((video, index) => {
                const isFirstVideo = video.order === 0;
                const isLocked = !isEnrolled && !isFirstVideo;
                const isActive = selectedVideo?.id === video.id || (selectedVideo?.id === 'preview' && isFirstVideo);
                
                return (
                  <div
                    key={video.id}
                    className={`playlist-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                    onClick={() => handleVideoSelect(video)}
                  >
                    <div className="thumbnail">
                      <div className="play-icon">
                        {isLocked ? <FaLock /> : '▶'}
                      </div>
                      <span className="duration">{video.order + 1}</span>
                    </div>
                    
                    <div className="video-info">
                      <h4 className="title">{video.title}</h4>
                      <div className="meta">
                        <span className="lesson">Lesson {video.order + 1}</span>
                        {isFirstVideo && !isEnrolled && (
                          <span className="preview">🎬 Preview</span>
                        )}
                        {isLocked && (
                          <span className="locked">🔒 Locked</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-content">
                <p>No videos available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEnrolled ? (
        <div className="enrolled-badge">You are enrolled in this course</div>
      ) : (
        <div className="enrollment-section">
          {course && course.price > 0 ? (
            <div className="course-pricing">
              <h3>Course Fee</h3>
              <div className="price-display">
                {course.discount_price ? (
                  <>
                    <span className="original-price">₹{course.price}</span>
                    <span className="discount-price">₹{course.discount_price}</span>
                  </>
                ) : (
                  <span className="regular-price">₹{course.price}</span>
                )}
              </div>
              <button 
                className="enroll-button" 
                onClick={handleEnroll}
                disabled={enrolling || paymentProcessing || !user}
              >
                {enrolling || paymentProcessing ? 'Processing...' : user ? 'Pay & Enroll Now' : 'Login to Enroll'}
              </button>
              <button 
                className="enquiry-button"
                onClick={() => setShowEnquiryForm(true)}
              >
                Submit an Enquiry
              </button>
            </div>
          ) : (
            <button 
              className="enroll-button" 
              onClick={handleEnroll}
              disabled={enrolling || !user}
            >
              {enrolling ? 'Enrolling...' : user ? 'Enroll in this Course' : 'Login to Enroll'}
            </button>
          )}
        </div>
      )}
      
      {/* Enquiry Form Modal */}
      {showEnquiryForm && (
        <div className="enquiry-modal">
          <div className="enquiry-modal-content">
            <h2>Course Enquiry</h2>
            <button className="close-button" onClick={() => setShowEnquiryForm(false)}>×</button>
            
            <form onSubmit={handleEnquirySubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={enquiryData.name} 
                  onChange={handleEnquiryChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={enquiryData.email} 
                  onChange={handleEnquiryChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  value={enquiryData.phone} 
                  onChange={handleEnquiryChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message (Optional)</label>
                <textarea 
                  id="message" 
                  name="message" 
                  value={enquiryData.message} 
                  onChange={handleEnquiryChange}
                  rows="4"
                ></textarea>
              </div>
              
              <button type="submit" className="submit-button">Submit Enquiry</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;