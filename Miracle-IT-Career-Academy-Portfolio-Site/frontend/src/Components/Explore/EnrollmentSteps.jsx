import React, { useRef } from 'react';
import './EnrollmentSteps.css';
import { motion, useScroll, useTransform } from 'framer-motion';

const EnrollmentSteps = () => {
  const steps = [
    {
      number: 1,
      title: "Choose Your Course",
      description: "Browse our catalog and select a course that aligns with your career goals.",
      icon: "search-icon",
      features: ["Expert-curated content", "Industry-relevant skills"]
    },
    {
      number: 2,
      title: "Enroll Online",
      description: "Complete our streamlined enrollment process and gain immediate access.",
      icon: "enroll-icon",
      features: ["Secure payment", "Instant access"]
    },
    {
      number: 3,
      title: "Start Learning",
      description: "Begin your journey with expert-led lessons and personalized support.",
      icon: "learn-icon",
      features: ["24/7 mentor support", "Real-world projects"]
    }
  ];

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const pathHeight = useTransform(scrollYProgress, [0, 0.3], ["0%", "100%"]);
  
  // Step 1 animations
  const step1X = useTransform(scrollYProgress, [0.1, 0.2], [-100, 0]);
  const step1Opacity = useTransform(scrollYProgress, [0.1, 0.2], [0, 1]);
  const step1Scale = useTransform(scrollYProgress, [0.1, 0.2], [0.8, 1]);
  const step1FeatureOpacity = useTransform(scrollYProgress, [0.15, 0.2], [0, 1]);
  const step1FeatureY = useTransform(scrollYProgress, [0.15, 0.2], [10, 0]);
  
  // Step 2 animations
  const step2X = useTransform(scrollYProgress, [0.25, 0.35], [100, 0]);
  const step2Opacity = useTransform(scrollYProgress, [0.25, 0.35], [0, 1]);
  const step2Scale = useTransform(scrollYProgress, [0.25, 0.35], [0.8, 1]);
  const step2FeatureOpacity = useTransform(scrollYProgress, [0.3, 0.35], [0, 1]);
  const step2FeatureY = useTransform(scrollYProgress, [0.3, 0.35], [10, 0]);
  
  // Step 3 animations
  const step3X = useTransform(scrollYProgress, [0.4, 0.5], [-100, 0]);
  const step3Opacity = useTransform(scrollYProgress, [0.4, 0.5], [0, 1]);
  const step3Scale = useTransform(scrollYProgress, [0.4, 0.5], [0.8, 1]);
  const step3FeatureOpacity = useTransform(scrollYProgress, [0.45, 0.5], [0, 1]);
  const step3FeatureY = useTransform(scrollYProgress, [0.45, 0.5], [10, 0]);
  
  // End animations
  const endOpacity = useTransform(scrollYProgress, [0.6, 0.8], [0, 1]);
  const endScale = useTransform(scrollYProgress, [0.6, 0.8], [0.8, 1]);
  const endY = useTransform(scrollYProgress, [0.6, 0.8], [20, 0]);
  const flagY = useTransform(scrollYProgress, [0.7, 0.9], [20, 0]);
  const flagOpacity = useTransform(scrollYProgress, [0.7, 0.9], [0, 1]);
  const buttonOpacity = useTransform(scrollYProgress, [0.8, 1], [0, 1]);
  const buttonY = useTransform(scrollYProgress, [0.8, 1], [20, 0]);

  return (
    <motion.div 
      className="enrollment-container"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      ref={containerRef}
    >
      <div className="enrollment-header">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Your Learning Roadmap
        </motion.h2>
        <motion.p 
          className="subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Follow this path to transform your career
        </motion.p>
      </div>
      
      <div className="roadmap-container">
        <motion.div 
          className="roadmap-path"
          style={{ height: pathHeight }}
        >
          <div className="roadmap-line"></div>
        </motion.div>
        
        {/* Step 1 */}
        <motion.div 
          className="roadmap-step left"
          style={{ 
            opacity: step1Opacity,
            x: step1X,
          }}
        >
          <motion.div 
            className="roadmap-milestone"
            style={{ scale: step1Scale }}
          >
            <div className="roadmap-number">1</div>
            <div className="roadmap-icon search-icon"></div>
          </motion.div>
          
          <motion.div 
            className="roadmap-content"
            style={{ opacity: step1Opacity }}
          >
            <h3>{steps[0].title}</h3>
            <p>{steps[0].description}</p>
            <div className="roadmap-features">
              {steps[0].features.map((feature, i) => (
                <motion.span 
                  key={i}
                  style={{ 
                    opacity: step1FeatureOpacity,
                    y: step1FeatureY
                  }}
                >
                  {feature}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Step 2 */}
        <motion.div 
          className="roadmap-step right"
          style={{ 
            opacity: step2Opacity,
            x: step2X,
          }}
        >
          <motion.div 
            className="roadmap-milestone"
            style={{ scale: step2Scale }}
          >
            <div className="roadmap-number">2</div>
            <div className="roadmap-icon enroll-icon"></div>
          </motion.div>
          
          <motion.div 
            className="roadmap-content"
            style={{ opacity: step2Opacity }}
          >
            <h3>{steps[1].title}</h3>
            <p>{steps[1].description}</p>
            <div className="roadmap-features">
              {steps[1].features.map((feature, i) => (
                <motion.span 
                  key={i}
                  style={{ 
                    opacity: step2FeatureOpacity,
                    y: step2FeatureY
                  }}
                >
                  {feature}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Step 3 */}
        <motion.div 
          className="roadmap-step left"
          style={{ 
            opacity: step3Opacity,
            x: step3X,
          }}
        >
          <motion.div 
            className="roadmap-milestone"
            style={{ scale: step3Scale }}
          >
            <div className="roadmap-number">3</div>
            <div className="roadmap-icon learn-icon"></div>
          </motion.div>
          
          <motion.div 
            className="roadmap-content"
            style={{ opacity: step3Opacity }}
          >
            <h3>{steps[2].title}</h3>
            <p>{steps[2].description}</p>
            <div className="roadmap-features">
              {steps[2].features.map((feature, i) => (
                <motion.span 
                  key={i}
                  style={{ 
                    opacity: step3FeatureOpacity,
                    y: step3FeatureY
                  }}
                >
                  {feature}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="roadmap-end"
          style={{ 
            opacity: endOpacity,
            scale: endScale,
            y: endY
          }}
        >
          <motion.div 
            className="roadmap-flag"
            style={{ 
              y: flagY,
              opacity: flagOpacity
            }}
          >
            <span>Success!</span>
          </motion.div>
          <motion.button 
            className="cta-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              opacity: buttonOpacity,
              y: buttonY
            }}
          >
            Start Your Journey
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EnrollmentSteps;