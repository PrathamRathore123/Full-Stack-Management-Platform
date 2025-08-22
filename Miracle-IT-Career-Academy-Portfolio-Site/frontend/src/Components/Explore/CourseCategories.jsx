import React, { useRef, createRef } from 'react';
import { Link } from 'react-router-dom';
import './CourseCategories.css';

const CourseCategories = ({ courses }) => {
  // Group courses by category
  const groupedCourses = courses.reduce((acc, course) => {
    const category = course.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(course);
    return acc;
  }, {});

  // Define category display names and order
  const categoryDisplayNames = {
    'development': 'Web Development',
    'ai_ml': 'AI & Machine Learning',
    'cloud': 'Cloud Computing',
    'data_science': 'Data Science',
    'basic_computer': 'Basic Computer Skills',
    'job_linked': 'Job-Linked Programs',
    'Uncategorized': 'Other Courses'
  };

  // Sort categories by priority
  const sortedCategories = Object.keys(groupedCourses).sort((a, b) => {
    const orderA = Object.keys(categoryDisplayNames).indexOf(a);
    const orderB = Object.keys(categoryDisplayNames).indexOf(b);
    return orderA - orderB;
  });

  // Create refs for each category
  const categoryRefs = sortedCategories.reduce((acc, category) => {
    acc[category] = createRef();
    return acc;
  }, {});

  // Scroll functions
  const scroll = (category, direction) => {
    if (categoryRefs[category].current) {
      categoryRefs[category].current.scrollBy({
        left: direction * 300,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="course-categories">
      <h2>Explore Our Courses</h2>
      
      {sortedCategories.map(category => (
        <div key={category} className="category-section">
          <div className="category-header">
            <h3>{categoryDisplayNames[category] || category}</h3>
            <div className="slider-controls">
              <button 
                className="slider-btn" 
                onClick={() => scroll(category, -1)} 
                aria-label="Scroll left"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button 
                className="slider-btn" 
                onClick={() => scroll(category, 1)} 
                aria-label="Scroll right"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
          
          <div className="category-slider-container">
            <div className="category-courses" ref={categoryRefs[category]}>
              {groupedCourses[category].map(course => (
                <div className="course-card" key={course.id}>
                  <div className="course-image">
                    <img src={course.image || '/placeholder-course.jpg'} alt={course.title} />
                    <div className="course-badge">{course.level}</div>
                  </div>
                  <div className="course-details">
                    <h4>{course.title}</h4>
                    <p>{course.description?.substring(0, 80)}...</p>
                    <div className="course-meta">
                      <span><i className="far fa-clock"></i> {course.duration}</span>
                      <span><i className="fas fa-users"></i> {course.students || '0'} students</span>
                    </div>
                    <Link to={`/explore/course/${course.id}`} className="enroll-btn">View Course</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseCategories;