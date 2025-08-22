import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './CourseTemplate.css';
import { 
  FaClock, FaBriefcase, FaCertificate, FaCode, 
  FaChevronDown, FaChevronUp, FaLock, FaGraduationCap,
  FaLaptopCode, FaTools, FaCheckCircle
} from 'react-icons/fa';
import { UserContext } from '../UserContext';
import { enrollInCourse, getUserEnrollments } from '../../api';

const CourseTemplate = ({ 
  title, 
  description, 
  duration = "12 Weeks", 
  internshipDuration = "4 Weeks", 
  isCertified = true,
  syllabus = [],
  technologies = [],
  learningOutcomes = [],
  placementAssistance = true,
  courseId
}) => {
  const [openModules, setOpenModules] = useState({ 1: true });
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (user && courseId) {
        try {
          const enrollments = await getUserEnrollments();
          const enrolled = enrollments.some(enrollment => enrollment.course === parseInt(courseId));
          setIsEnrolled(enrolled);
        } catch (err) {
          console.error('Error checking enrollment status:', err);
        }
      }
    };

    checkEnrollmentStatus();
  }, [courseId, user]);
  
  // Set first module as open by default when syllabus changes
  useEffect(() => {
    if (syllabus && syllabus.length > 0) {
      const firstModuleId = syllabus[0].id || 1;
      setOpenModules({ [firstModuleId]: true });
    }
  }, [syllabus]);

  const toggleModule = (moduleId) => {
    setOpenModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    try {
      setEnrolling(true);
      await enrollInCourse(courseId);
      setIsEnrolled(true);
      setEnrolling(false);
    } catch (err) {
      console.error('Error enrolling in course:', err);
      setEnrolling(false);
    }
  };

  return (
    <div className="course-template-container">
      <div className="course-header">
        <h1>{title}</h1>
        <p className="course-intro">
          {description}
        </p>
      </div>

      <div className="course-features">
        <div className="feature-card">
          <h3><FaClock /> Course Duration</h3>
          <p>{duration} of intensive training with live projects and mentorship</p>
        </div>
        <div className="feature-card">
          <h3><FaBriefcase /> Internship</h3>
          <p>{internshipDuration} of industry internship with real-world project experience</p>
        </div>
        <div className="feature-card">
          <h3><FaCertificate /> Certification</h3>
          <p>{isCertified ? 'Industry-recognized certification upon successful completion' : 'No certification for this course'}</p>
        </div>
        {placementAssistance && (
          <div className="feature-card">
            <h3><FaGraduationCap /> Placement Assistance</h3>
            <p>100% placement assistance with interview preparation and resume building</p>
          </div>
        )}
      </div>

      <div className="course-syllabus">
        <h2>Course Syllabus</h2>
        
        {syllabus.length > 0 ? (
          syllabus.map((module, index) => (
            <div className="module" key={module.id || index}>
              <div 
                className="module-header" 
                onClick={() => toggleModule(module.id || index + 1)}
              >
                <h3><span>{module.order || index + 1}</span>{module.title}</h3>
                {openModules[module.id || index + 1] ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              <div className={`module-content ${openModules[module.id || index + 1] ? 'open' : ''}`}>
                {module.items && module.items.length > 0 ? (
                  module.items.map((item, itemIndex) => (
                    <div className="module-item" key={item.id || itemIndex}>
                      {item.title}
                      {item.description && <p className="item-description">{item.description}</p>}
                    </div>
                  ))
                ) : (
                  <p className="no-items">No items in this module</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-syllabus">
            <p>No syllabus available for this course yet. Please check back later.</p>
          </div>
        )}
      </div>

      <div className="course-technologies">
        <h2><FaTools /> Technologies You'll Learn</h2>
        <div className="technologies-grid">
          {technologies.map((tech, index) => (
            <div className="technology-card" key={index}>
              <div className="tech-icon">
                {tech.icon || <FaLaptopCode />}
              </div>
              <h3>{tech.name}</h3>
              {tech.description && <p>{tech.description}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="learning-outcomes">
        <h2><FaCheckCircle /> What You'll Learn</h2>
        <ul className="outcomes-list">
          {learningOutcomes.map((outcome, index) => (
            <li key={index}>{outcome}</li>
          ))}
        </ul>
      </div>

      <div className="enroll-section">
        {isEnrolled ? (
          <div className="enrolled-badge">You are enrolled in this course</div>
        ) : (
          <button 
            className="enroll-button"
            onClick={handleEnroll}
            disabled={enrolling}
          >
            {!user && <FaLock style={{marginRight: '8px'}} />}
            {enrolling ? 'Enrolling...' : user ? 'Enroll Now' : 'Login to Enroll'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseTemplate;