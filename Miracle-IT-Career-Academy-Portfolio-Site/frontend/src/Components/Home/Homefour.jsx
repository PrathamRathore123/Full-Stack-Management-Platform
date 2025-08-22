import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Homefour.css';
import image from '../Images/Laptop.png';

export default function Homefour() {
  const sliderRef = useRef(null);
  const [autoplay, setAutoplay] = useState(true);
  const navigate = useNavigate();
  let startX, initialScrollLeft;

  // Courses data
  const courses = [
    {
      id: 1,
      title: 'Complete Web Development Bootcamp',
      category: 'Web Development',
      instructor: 'John Smith',
      rating: 4.8,
      price: '$89.99',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8d2ViJTIwZGV2ZWxvcG1lbnR8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 2,
      title: 'React Native - Mobile App Development',
      category: 'Mobile Development',
      instructor: 'Sarah Johnson',
      rating: 4.7,
      price: '$79.99',
      image: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8bW9iaWxlJTIwZGV2ZWxvcG1lbnR8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 3,
      title: 'Python for Data Science and Machine Learning',
      category: 'Data Science',
      instructor: 'Michael Chen',
      rating: 4.9,
      price: '$94.99',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8ZGF0YSUyMHNjaWVuY2V8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 4,
      title: 'UI/UX Design Masterclass',
      category: 'UI/UX Design',
      instructor: 'Emma Wilson',
      rating: 4.6,
      price: '$69.99',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8dWklMjB1eHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 5,
      title: 'AWS Cloud Practitioner Certification',
      category: 'Cloud Computing',
      instructor: 'David Miller',
      rating: 4.8,
      price: '$99.99',
      image: image
    },
    {
      id: 6,
      title: 'Advanced JavaScript Concepts',
      category: 'Web Development',
      instructor: 'Alex Turner',
      rating: 4.7,
      price: '$84.99',
      image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8amF2YXNjcmlwdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 7,
      title: 'Flutter App Development',
      category: 'Mobile Development',
      instructor: 'Jessica Lee',
      rating: 4.8,
      price: '$89.99',
      image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8bW9iaWxlJTIwYXBwfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 8,
      title: 'DevOps Engineering Professional',
      category: 'DevOps',
      instructor: 'Robert Johnson',
      rating: 4.9,
      price: '$109.99',
      image: 'https://images.unsplash.com/photo-1607743386760-88ac62b89b8a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8ZGV2b3BzfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 9,
      title: 'Blockchain Development Fundamentals',
      category: 'Blockchain',
      instructor: 'Thomas Wilson',
      rating: 4.6,
      price: '$99.99',
      image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8YmxvY2tjaGFpbnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 10,
      title: 'Cybersecurity Specialist Course',
      category: 'Security',
      instructor: 'Olivia Martinez',
      rating: 4.9,
      price: '$119.99',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8Y3liZXJzZWN1cml0eXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60'
    }
  ];

  // Continuous autoplay functionality
  useEffect(() => {
    let interval;
    if (autoplay && sliderRef.current) {
      interval = setInterval(() => {
        // Calculate the width of one card (including margin)
        const cardWidth = sliderRef.current.offsetWidth / 3;
        
        if (sliderRef.current.scrollLeft + sliderRef.current.offsetWidth >= sliderRef.current.scrollWidth - 20) {
          // When reaching the end, smoothly reset to beginning
          sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll by exactly one card width
          sliderRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
      }, 3000); // Autoplay interval
    }
    return () => clearInterval(interval);
  }, [autoplay]);

  // Pause autoplay on hover
  const handleMouseEnter = () => setAutoplay(false);
  const handleMouseOut = () => setAutoplay(true);

  // Mouse events for slider functionality
  const handleMouseDown = (e) => {
    if (!sliderRef.current) return;
    
    startX = e.pageX - sliderRef.current.offsetLeft;
    initialScrollLeft = sliderRef.current.scrollLeft;
    sliderRef.current.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    if (!sliderRef.current) return;
    sliderRef.current.style.cursor = 'grab';
    setAutoplay(true);
  };

  const handleMouseUp = () => {
    if (!sliderRef.current) return;
    sliderRef.current.style.cursor = 'grab';
  };

  const handleMouseMove = (e) => {
    if (!sliderRef.current || !startX) return;
    
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed
    sliderRef.current.scrollLeft = initialScrollLeft - walk;
  };

  return (
    <section className="popular-courses-section">
      <div className="container">
        <div className="section-header">
          <h2>Popular Courses</h2>
          <p>Discover our collection of 20+ professional courses to boost your career</p>
        </div>

        <div className="courses-slider-container">
          <div 
            className="courses-slider" 
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseOut={handleMouseOut}
          >
            {courses.map(course => (
              <div className="course-slide" key={course.id}>
                <div className="course-image">
                  <img src={course.image} alt={course.title} />
                  <div className="course-overlay">
                    <span className="course-category">{course.category}</span>
                  </div>
                  <div className="course-badge">
                    <span>Bestseller</span>
                  </div>
                </div>
                <div className="course-content">
                  <h3 className="course-title">{course.title}</h3>
                  <div className="course-meta">
                    <div className="course-instructor">
                      <i className="fas fa-user"></i> {course.instructor}
                    </div>
                    <div className="course-rating">
                      <i className="fas fa-star"></i> {course.rating}
                    </div>
                  </div>
                  <div className="course-stats">
                    <span><i className="fas fa-users"></i> 2.5k students</span>
                    <span><i className="fas fa-clock"></i> 15 hours</span>
                  </div>
                  <div className="course-price">
                    <span>{course.price}</span>
                    <button className="enroll-btn">Enroll Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="view-all-container">
          <button className="view-all-btn" onClick={() => navigate('/courses')}>Explore All Courses</button>
        </div>
        
        <div className="slider-indicators">
          {[...Array(Math.ceil(courses.length / 3))].map((_, i) => (
            <span 
              key={i} 
              className={`indicator ${i === 0 ? 'active' : ''}`}
              onClick={() => sliderRef.current?.scrollTo({ left: i * sliderRef.current.offsetWidth, behavior: 'smooth' })}
            ></span>
          ))}
        </div>
      </div>
    </section>
  );
}