import React, { useEffect, useState } from 'react';
import './Homethree.css';
import { motion, AnimatePresence } from 'framer-motion';

// Enhanced features data with images
const features = [
  { 
    title: 'Attendance Tracking', 
    icon: '📊', 
    description: 'Real-time attendance insights with instant notifications for students and parents.',
    color: '#4ade80',
    highlight: 'Real-time insights',
    image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  { 
    title: 'Course Videos', 
    icon: '🎬', 
    description: 'HD quality course videos with downloadable options for offline learning.',
    color: '#4ade80',
    highlight: 'Offline learning',
    image: 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  { 
    title: 'Performance Analysis', 
    icon: '📈', 
    description: 'AI-powered analytics to track progress and identify improvement areas.',
    color: '#4ade80',
    highlight: 'AI-powered',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  { 
    title: 'Certificates', 
    icon: '🏆', 
    description: 'Industry-recognized certificates with blockchain verification technology.',
    color: '#4ade80',
    highlight: 'Blockchain verified',
    image: 'https://images.unsplash.com/photo-1523289333742-be1143f6b766?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  { 
    title: 'Fees Tracking', 
    icon: '💰', 
    description: 'Transparent fee structure with multiple payment options and installments.',
    color: '#4ade80',
    highlight: 'Flexible payments',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  { 
    title: 'AI Assistant', 
    icon: '🤖', 
    description: 'Personalized AI learning assistant available 24/7 to answer your questions.',
    color: '#4ade80',
    highlight: '24/7 support',
    image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  { 
    title: 'Flexible Learning', 
    icon: '🕒', 
    description: 'Learn at your own pace with flexible schedules and customizable modules.',
    color: '#4ade80',
    highlight: 'Self-paced',
    image: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  { 
    title: 'Verified Mentors', 
    icon: '👨‍🏫', 
    description: 'Learn from industry experts with years of practical experience.',
    color: '#4ade80',
    highlight: 'Industry experts',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  { 
    title: '5000+ Trained', 
    icon: '👥', 
    description: 'Join our community of over 5000 successful graduates worldwide.',
    color: '#4ade80',
    highlight: 'Global community',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  { 
    title: 'Student Testimonials', 
    icon: '⭐', 
    description: 'Hear success stories from our alumni working at top companies globally.',
    color: '#4ade80',
    highlight: 'Success stories',
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
];

// Animation variants
const headerVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const listItemVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: (i) => ({ 
    opacity: 1, 
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.3
    }
  }
};

// Feature list item component
const FeatureListItem = ({ feature, index, isActive, onClick }) => {
  return (
    <motion.div
      custom={index}
      variants={listItemVariants}
      className={`feature-list-item ${isActive ? 'active' : ''}`}
      onClick={() => onClick(index)}
      whileHover={{ 
        x: 10,
        transition: { duration: 0.2 }
      }}
    >
      <div className="feature-icon" style={{ background: `linear-gradient(135deg, ${feature.color}, ${feature.color}40)` }}>
        {feature.icon}
      </div>
      <div className="feature-content">
        <h3>{feature.title}</h3>
        <p>{feature.description}</p>
        {isActive && (
          <motion.span 
            className="feature-highlight"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {feature.highlight}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
};

// Main component
export default function WhyChooseUsPage() {
  const ITEMS_PER_PAGE = 4; // Updated to show 4 items at a time
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(features.length / ITEMS_PER_PAGE);
  
  // Get current visible features
  const getCurrentFeatures = () => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    return features.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };
  
  // Handle feature item click
  const handleFeatureClick = (index) => {
    const globalIndex = (currentPage * ITEMS_PER_PAGE) + index;
    setActiveFeature(globalIndex);
  };
  
  // Navigate to next page
  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };
  
  // Navigate to previous page
  const prevPage = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };
  
  // Auto-rotate active feature and page
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => {
        const next = (prev + 1) % features.length;
        // If next active feature is on a different page, change the page
        const nextPage = Math.floor(next / ITEMS_PER_PAGE);
        if (nextPage !== currentPage) {
          setCurrentPage(nextPage);
        }
        return next;
      });
    }, 4000); // Increased time for better user experience
    
    return () => clearInterval(interval);
  }, [currentPage]);
  
  // Calculate local index for highlighting in the current page
  const getLocalActiveIndex = () => {
    const localIndex = activeFeature % ITEMS_PER_PAGE;
    const activePage = Math.floor(activeFeature / ITEMS_PER_PAGE);
    return activePage === currentPage ? localIndex : -1;
  };
  
  return (
    <div className="why-container-homethree">
      {/* Background particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <motion.div 
            key={i}
            className="particle"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5 + 0.1
            }}
            animate={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5 + 0.1
            }}
            transition={{ 
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            style={{
              width: Math.random() * 10 + 5,
              height: Math.random() * 10 + 5,
              background: `rgba(74, 222, 128, ${Math.random() * 0.2 + 0.1})`
            }}
          />
        ))}
      </div>
      
      <div className="why-content-container">
        <motion.div 
          className="why-header"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="why-title">
            Why Choose <span style={{ color: '#4ade80' }}>Us</span>
          </h1>
          <p className="why-subtitle">
            Empowering Your Future with <strong style={{ color: '#4ade80' }}>Smarter Learning</strong> Solutions
          </p>
        </motion.div>
        
        <div className="why-main-content">
          {/* Left side - Feature list */}
          <div className="feature-list-container">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentPage}
                className="feature-list scrollable"
                variants={listContainerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {getCurrentFeatures().map((feature, index) => (
                  <FeatureListItem 
                    key={`${currentPage}-${feature.title}`}
                    feature={feature} 
                    index={index}
                    isActive={index === getLocalActiveIndex()}
                    onClick={handleFeatureClick}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
            
            <div className="page-indicator">
              {[...Array(totalPages)].map((_, i) => (
                <span 
                  key={i} 
                  className={`page-dot ${currentPage === i ? 'active' : ''}`}
                  onClick={() => setCurrentPage(i)}
                />
              ))}
            </div>
          </div>
          
          {/* Right side - Image display */}
          <div className="feature-image-container">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeFeature}
                className="feature-image-box"
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <img 
                  src={features[activeFeature].image} 
                  alt={features[activeFeature].title} 
                  className="feature-image"
                />
                <div className="feature-image-overlay">
                  <h3>{features[activeFeature].title}</h3>
                  <span className="feature-tag">{features[activeFeature].highlight}</span>
                </div>
              </motion.div>
            </AnimatePresence>
            
            <div className="stats-container-homethree">
              <div className="stat-item">
                <span className="stat-number">5000+</span>
                <span className="stat-label">Students</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Courses</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">98%</span>
                <span className="stat-label">Success Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}