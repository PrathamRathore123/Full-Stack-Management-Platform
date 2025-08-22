import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './components.css';
import { fetchLatestCourses, fetchWorkshops } from '../../api';
import { FaCalendarAlt, FaBook, FaClock, FaChalkboardTeacher, FaMapMarkerAlt, 
         FaUsers, FaRegClock, FaGraduationCap, FaCertificate, FaLaptopCode, 
         FaCode, FaDatabase, FaMobile, FaServer, FaCloud, FaFilter } from 'react-icons/fa';

const Workshops = () => {
  const navigate = useNavigate();
  const [workshopsList, setWorkshopsList] = useState([]);
  const [latestCourses, setLatestCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Sample workshops data in case API fails
  const sampleWorkshops = [
    {
      id: 1,
      title: "Advanced React Development",
      description: "Learn advanced React patterns, hooks, and state management techniques to build professional applications.",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      time: "10:00 AM - 4:00 PM",
      location: "Online (Zoom)",
      available_seats: 25,
      category: "react",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      target_audience: "Intermediate React Developers"
    },
    {
      id: 2,
      title: "Python for Data Science",
      description: "Master Python libraries like Pandas, NumPy and Matplotlib for data analysis and visualization.",
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      time: "9:00 AM - 3:00 PM",
      location: "Hybrid (In-person & Online)",
      available_seats: 20,
      category: "python",
      image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
      target_audience: "Beginners with basic Python knowledge"
    },
    {
      id: 3,
      title: "Full Stack JavaScript Development",
      description: "Build complete web applications with Node.js, Express and MongoDB backend with React frontend.",
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      time: "10:00 AM - 5:00 PM",
      location: "Tech Hub Center",
      category: "javascript",
      image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
      highlights: ["Built a complete MERN stack application", "Learned authentication and authorization", "Deployed to cloud platforms"],
      gallery: [
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
      ],
      testimonial: {
        quote: "This workshop completely changed how I approach JavaScript development. Highly recommended!",
        author: "Rahul M., Web Developer"
      }
    },
    {
      id: 4,
      title: "Mobile App Development with Flutter",
      description: "Create beautiful cross-platform mobile applications with Flutter and Dart programming language.",
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
      time: "9:30 AM - 4:30 PM",
      location: "Innovation Center",
      category: "mobile",
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
      highlights: ["Built and published a real-world app", "Learned state management with Provider", "Implemented Firebase integration"],
      gallery: [
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
      ]
    }
  ];
  
  // Refs for scroll animations
  const aboutRef = useRef(null);
  const workshopsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const coursesRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Use fetchWorkshops from api.js instead of direct axios call
        const workshopsData = await fetchWorkshops();
        const coursesData = await fetchLatestCourses();
        
        // If we get data from API, use it, otherwise use sample data
        setWorkshopsList(Array.isArray(workshopsData) && workshopsData.length > 0 ? workshopsData : sampleWorkshops);
        setLatestCourses(coursesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching workshops:', err);
        // Use sample workshops data if API fails
        setWorkshopsList(sampleWorkshops);
        
        // Continue showing courses even if workshops fail to load
        try {
          const coursesData = await fetchLatestCourses();
          setLatestCourses(coursesData);
        } catch (courseErr) {
          console.error('Error fetching courses:', courseErr);
        }
        setError(null); // No error since we're showing sample data
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);
    
    // Observe all section headers
    const sections = document.querySelectorAll('.section-header');
    sections.forEach(section => {
      sectionObserver.observe(section);
    });
    
    return () => {
      sections.forEach(section => {
        sectionObserver.unobserve(section);
      });
    };
  }, [loading]);

  // Filter workshops based on date (past or upcoming)
  const currentDate = new Date();
  const upcomingWorkshops = workshopsList.filter(workshop => {
    if (!workshop.date) return false;
    
    // Handle date strings that might contain additional info like time
    let dateStr = workshop.date;
    if (dateStr.includes('(')) {
      dateStr = dateStr.split('(')[0].trim();
    }
    if (dateStr.includes('to')) {
      dateStr = dateStr.split('to')[0].trim();
    }
    
    try {
      const workshopDate = new Date(dateStr);
      return !isNaN(workshopDate) && workshopDate >= currentDate;
    } catch (e) {
      console.error('Error parsing date:', workshop.date);
      return false;
    }
  });
  
  const pastWorkshops = workshopsList.filter(workshop => {
    if (!workshop.date) return false;
    
    // Handle date strings that might contain additional info like time
    let dateStr = workshop.date;
    if (dateStr.includes('(')) {
      dateStr = dateStr.split('(')[0].trim();
    }
    if (dateStr.includes('to')) {
      dateStr = dateStr.split('to')[0].trim();
    }
    
    try {
      const workshopDate = new Date(dateStr);
      return !isNaN(workshopDate) && workshopDate < currentDate;
    } catch (e) {
      console.error('Error parsing date:', workshop.date);
      return false;
    }
  });
  
  // Log for debugging
  console.log('All workshops:', workshopsList);
  console.log('Past workshops:', pastWorkshops);
  console.log('Upcoming workshops:', upcomingWorkshops);

  // Filter workshops by category if needed
  const filterWorkshopsByCategory = (workshops) => {
    if (activeCategory === 'all') return workshops;
    
    // Add debugging to see what's happening
    console.log('Filtering by category:', activeCategory);
    console.log('Workshops before filtering:', workshops);
    
    const filtered = workshops.filter(workshop => {
      // Check if category exists and matches
      const hasMatchingCategory = workshop.category && 
                                 workshop.category.toLowerCase() === activeCategory.toLowerCase();
      
      console.log(`Workshop ${workshop.id} - ${workshop.title} - Category: ${workshop.category} - Matches: ${hasMatchingCategory}`);
      
      return hasMatchingCategory;
    });
    
    console.log('Filtered workshops:', filtered);
    return filtered;
  };

  const filteredUpcomingWorkshops = filterWorkshopsByCategory(upcomingWorkshops);
  const filteredPastWorkshops = filterWorkshopsByCategory(pastWorkshops);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading amazing workshops...</p>
      </div>
    );
  }

  return ( 
    <div className="workshops-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Coding Workshops</h1>
          <p className="hero-subtitle">Master Programming Languages & Build Real-World Projects with Industry Experts</p>
          <div className="tech-icons">
            <i className="devicon-javascript-plain"></i>
            <i className="devicon-python-plain"></i>
            <i className="devicon-react-original"></i>
            <i className="devicon-nodejs-plain"></i>
            <i className="devicon-java-plain"></i>
          </div>
          <div className="hero-badges">
            <div className="hero-badge">
              <FaUsers className="badge-icon" /> 1000+ Students Trained
            </div>
            <div className="hero-badge">
              <FaLaptopCode className="badge-icon" /> Hands-on Projects
            </div>
            <div className="hero-badge">
              <FaCertificate className="badge-icon" /> Certification Included
            </div>
          </div>
        </div>
      </section>

      {/* About Our Workshops */}
      <section className="about-workshops">
        <div className="section-header">
          <h2>Coding Workshops & Tech Training</h2>
          <div className="section-underline"></div>
        </div>
        <p className="section-description">
          Our coding workshops are designed to help you master programming languages and technologies through hands-on practice.
          Learn from industry experts and build real-world projects that enhance your portfolio.
        </p>
        
        <div className="benefits-container">
          <div className="benefit-card">
            <div className="benefit-icon">
              <FaCode />
            </div>
            <h3>Practical Coding</h3>
            <p>Learn by doing with hands-on exercises and projects</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">
              <FaChalkboardTeacher />
            </div>
            <h3>Expert Mentors</h3>
            <p>Learn from experienced developers and tech professionals</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">
              <FaLaptopCode />
            </div>
            <h3>Industry Projects</h3>
            <p>Build portfolio-ready applications and systems</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">
              <FaCertificate />
            </div>
            <h3>Certification</h3>
            <p>Earn recognized credentials to boost your resume</p>
          </div>
        </div>
      </section>

      {/* Workshop Tabs */}
      <section className="workshops-tabs-section">
        <div className="section-header">
          <h2>Explore Workshops</h2>
          <div className="section-underline"></div>
        </div>
        
        <div className="tabs-header">
          <button 
            className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            <FaCalendarAlt className="tab-icon" /> Upcoming Workshops
          </button>
          <button 
            className={`tab-button ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            <FaClock className="tab-icon" /> Past Workshops
          </button>
        </div>
        
        <div className="category-filters">
          <button 
            className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            <span className="category-icon">All</span>
          </button>
          <button 
            className={`category-btn ${activeCategory === 'javascript' ? 'active' : ''}`}
            onClick={() => setActiveCategory('javascript')}
          >
            <i className="devicon-javascript-plain category-icon"></i> JS
          </button>
          <button 
            className={`category-btn ${activeCategory === 'python' ? 'active' : ''}`}
            onClick={() => setActiveCategory('python')}
          >
            <i className="devicon-python-plain category-icon"></i> Python
          </button>
          <button 
            className={`category-btn ${activeCategory === 'react' ? 'active' : ''}`}
            onClick={() => setActiveCategory('react')}
          >
            <i className="devicon-react-original category-icon"></i> React
          </button>
          <button 
            className={`category-btn ${activeCategory === 'java' ? 'active' : ''}`}
            onClick={() => setActiveCategory('java')}
          >
            <i className="devicon-java-plain category-icon"></i> Java
          </button>
          <button 
            className={`category-btn ${activeCategory === 'webdev' ? 'active' : ''}`}
            onClick={() => setActiveCategory('webdev')}
          >
            <i className="devicon-html5-plain category-icon"></i> Web
          </button>
          <button 
            className={`category-btn ${activeCategory === 'mobile' ? 'active' : ''}`}
            onClick={() => setActiveCategory('mobile')}
          >
            <i className="devicon-android-plain category-icon"></i> Mobile
          </button>
        </div>

        {error ? (
          <div className="error-message">
            <div className="error-icon">!</div>
            <div className="error-content">
              <h3>Oops! Something went wrong</h3>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="retry-btn"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="workshops-content">
            {activeTab === 'upcoming' ? (
              <div className="workshops-grid">
                {filteredUpcomingWorkshops.length > 0 ? (
                  filteredUpcomingWorkshops.map((workshop) => (
                    <div className="workshop-card" key={workshop.id}>
                      <div className="workshop-image">
                        <img 
                          src={workshop.image ? workshop.image : 'https://via.placeholder.com/300x200?text=Workshop'} 
                          alt={workshop.title} 
                        />
                        {workshop.category && (
                          <div className="workshop-badge">{workshop.category}</div>
                        )}
                      </div>
                      <div className="workshop-details">
                        <h3>{workshop.title}</h3>
                        <div className="workshop-tags">
                          {workshop.category && (
                            <span className="workshop-tag">{workshop.category}</span>
                          )}
                          {workshop.target_audience && (
                            <span className="workshop-tag audience-tag">{workshop.target_audience}</span>
                          )}
                        </div>
                        <p className="workshop-description">{workshop.description}</p>
                        <div className="workshop-meta">
                          <div className="meta-item">
                            <FaCalendarAlt className="meta-icon" /> 
                            <span>{new Date(workshop.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}</span>
                          </div>
                          <div className="meta-item">
                            <FaRegClock className="meta-icon" /> 
                            <span>{workshop.time || 'TBA'}</span>
                          </div>
                          <div className="meta-item">
                            <FaMapMarkerAlt className="meta-icon" /> 
                            <span>{workshop.location}</span>
                          </div>
                          <div className="meta-item">
                            <FaUsers className="meta-icon" /> 
                            <span>Available Seats: {workshop.available_seats || 'Limited'}</span>
                          </div>
                        </div>
                        <div className="workshop-actions">
                          <button 
                            className="register-btn"
                            onClick={() => navigate(`/explore/workshops/${workshop.id}/register`)}
                          >
                            Register Now
                          </button>
                          <button 
                            className="details-btn"
                            onClick={() => navigate(`/explore/workshops/${workshop.id}`)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-workshops">
                    <div className="empty-state-icon">
                      <FaCalendarAlt />
                    </div>
                    <p>No upcoming workshops available at the moment.</p>
                    <p className="empty-state-subtext">Check back soon for new workshops!</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="workshops-grid">
                {filteredPastWorkshops.length > 0 ? (
                  filteredPastWorkshops.map((workshop) => (
                    <div 
                      className="workshop-card past-workshop-card" 
                      key={workshop.id}
                      onClick={() => navigate(`/explore/workshops/${workshop.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="workshop-image">
                        <img 
                          src={workshop.image ? workshop.image : 'https://via.placeholder.com/300x200?text=Past+Workshop'} 
                          alt={workshop.title} 
                        />
                        {workshop.category && (
                          <div className="workshop-badge">{workshop.category}</div>
                        )}
                        <div className="completed-badge">
                          <FaClock className="completed-icon" /> Completed
                        </div>
                      </div>
                      <div className="workshop-details">
                        <h3>{workshop.title}</h3>
                        <div className="workshop-tags">
                          {workshop.category && (
                            <span className="workshop-tag">{workshop.category}</span>
                          )}
                          {workshop.target_audience && (
                            <span className="workshop-tag audience-tag">{workshop.target_audience}</span>
                          )}
                        </div>
                        <p className="workshop-description">{workshop.description}</p>
                        <div className="workshop-meta">
                          <div className="meta-item">
                            <FaCalendarAlt className="meta-icon" /> 
                            <span>{new Date(workshop.date).toLocaleDateString('en-US', {
                              month: 'short',
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
                            <span>{workshop.location || 'Online'}</span>
                          </div>
                          <div className="meta-item">
                            <FaUsers className="meta-icon" /> 
                            <span>{workshop.participants || '25+'} Participants</span>
                          </div>
                        </div>
                        
                        <div className="workshop-highlights">
                          <h4>Key Highlights:</h4>
                          <ul className="highlights-list">
                            {workshop.highlights ? 
                              workshop.highlights.map((highlight, index) => (
                                <li key={index}><span className="highlight-bullet">•</span> {highlight}</li>
                              )) : 
                              <>
                                <li><span className="highlight-bullet">•</span> Hands-on learning experience</li>
                                <li><span className="highlight-bullet">•</span> Interactive Q&A sessions</li>
                                <li><span className="highlight-bullet">•</span> Networking opportunities</li>
                              </>
                            }
                          </ul>
                        </div>
                        
                        {workshop.testimonial && (
                          <div className="workshop-testimonial">
                            <div className="quote-icon">❝</div>
                            <blockquote>
                              {workshop.testimonial.quote || "The workshop was incredibly informative and engaging."}
                            </blockquote>
                            <cite>- {workshop.testimonial.author || "Workshop Participant"}</cite>
                          </div>
                        )}
                        
                        <div className="workshop-actions">
                          <button className="materials-btn">View Materials</button>
                          <button className="recording-btn">Watch Recording</button>
                        </div>
                        
                        {workshop.gallery && workshop.gallery.length > 0 && (
                          <div className="gallery-preview">
                            <h4>Gallery</h4>
                            <div className="gallery-images">
                              {workshop.gallery.map((img, index) => (
                                <div className="gallery-thumbnail" key={index}>
                                  <img src={img} alt={`Workshop moment ${index + 1}`} />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-workshops">
                    <div className="empty-state-icon">
                      <FaClock />
                    </div>
                    <p>No past workshops to display.</p>
                    <p className="empty-state-subtext">Our journey is just beginning!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>
      
      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>What Our Students Say</h2>
          <div className="section-underline"></div>
        </div>
        <div className="testimonials-container">
          <div className="testimonial-card">
            <div className="quote-mark">"</div>
            <div className="testimonial-content">
              <blockquote>
                The workshop on Python programming was incredibly helpful. I learned practical skills that I'm now using in my projects. The instructors were knowledgeable and patient with beginners.
              </blockquote>
              <div className="testimonial-author">
                <div className="testimonial-image">
                  <img src="https://via.placeholder.com/60x60?text=R" alt="Student" />
                </div>
                <div className="author-details">
                  <h4>Rahul S.</h4>
                  <p>Class 12 Student</p>
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="quote-mark">"</div>
            <div className="testimonial-content">
              <blockquote>
                The career counseling workshop helped me understand my strengths and choose the right path for my future studies. I feel more confident about my college applications now.
              </blockquote>
              <div className="testimonial-author">
                <div className="testimonial-image">
                  <img src="https://via.placeholder.com/60x60?text=P" alt="Student" />
                </div>
                <div className="author-details">
                  <h4>Priya M.</h4>
                  <p>Class 11 Student</p>
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="quote-mark">"</div>
            <div className="testimonial-content">
              <blockquote>
                The science experiment workshop was both educational and fun. I never thought chemistry could be so interesting! The hands-on approach really helped me grasp difficult concepts.
              </blockquote>
              <div className="testimonial-author">
                <div className="testimonial-image">
                  <img src="https://via.placeholder.com/60x60?text=A" alt="Student" />
                </div>
                <div className="author-details">
                  <h4>Amit K.</h4>
                  <p>Class 9 Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Latest Courses Section - Keeping this from the original code but with enhanced styling */}
      <section className="latest-courses-section">
        <div className="section-header">
          <h2><FaBook className="section-icon" /> Latest Courses</h2>
          <div className="section-underline"></div>
        </div>
        <p className="section-description">Check out our newest courses and learning opportunities</p>
        
        <div className="latest-courses-list">
          {latestCourses.length > 0 ? (
            latestCourses.map((course) => (
              <div className="course-card" key={course.id}>
                <div className="course-image">
                  <img src={course.image || 'https://via.placeholder.com/300x200?text=Course'} alt={course.title} />
                  <div className="course-overlay">
                    <Link to={`/explore/courses/${course.id}`} className="view-details-btn">
                      View Details
                    </Link>
                  </div>
                </div>
                <div className="course-details">
                  <h3>{course.title}</h3>
                  <p className="course-description">{course.description.substring(0, 120)}...</p>
                  <div className="course-meta">
                    <div className="course-duration">
                      <FaClock className="meta-icon" /> {course.duration}
                    </div>
                    <div className="course-level">
                      <FaChalkboardTeacher className="meta-icon" /> {course.level}
                    </div>
                  </div>
                  <Link to={`/explore/courses/${course.id}`} className="view-course-btn">
                    View Course
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="no-courses">
              <div className="empty-state-icon">
                <FaBook />
              </div>
              <p>No new courses available at the moment.</p>
              <p className="empty-state-subtext">Check back soon for new learning opportunities!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Workshops;