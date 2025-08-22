import React, { useState, useEffect } from 'react';
import './ExploreIntro.css';
import { motion } from 'framer-motion';

const ExploreIntro = () => {
  const [text, setText] = useState("");
  const fullText = "Perfect";
  const typingSpeed = 150;
  
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          currentIndex = 0;
          const eraseInterval = setInterval(() => {
            if (currentIndex < fullText.length) {
              setText(fullText.slice(0, fullText.length - currentIndex - 1));
              currentIndex++;
            } else {
              clearInterval(eraseInterval);
              setText("");
              setTimeout(() => {
                setText(fullText);
              }, 500);
            }
          }, typingSpeed / 2);
        }, 2000);
      }
    }, typingSpeed);
    
    return () => clearInterval(typingInterval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 80,
        damping: 12
      }
    }
  };

  const statsVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        delay: 0.3
      }
    }
  };

  return (
    <div className="explore-intro-container">
      <div className="explore-bg-image"></div>
      <div className="explore-overlay"></div>
      
      <div className="intro-content-wrapper">
        <motion.div 
          className="intro-header-section"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="badge-container">
            <motion.span 
              className="premium-badge"
              whileHover={{ scale: 1.05 }}
            >
              Explore Our Courses
            </motion.span>
          </motion.div>
          
          <motion.h1 className="main-heading" variants={itemVariants}>
            Find Your <span className="accent-text typing-text">{text}</span> Course
          </motion.h1>
          
          
          <motion.p className="intro-tagline" variants={itemVariants}>
            Discover expert-led courses designed to elevate your skills
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="stats-container"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {[
            { number: '200+', label: 'Expert Courses' },
            { number: '50k+', label: 'Active Learners' },
            { number: '95%', label: 'Completion Rate' }
          ].map((stat, index) => (
            <motion.div 
              key={index}
              className="stat-box"
              variants={statsVariants}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
              }}
            >
              <span className="stat-value">{stat.number}</span>
              <span className="stat-text">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ExploreIntro;