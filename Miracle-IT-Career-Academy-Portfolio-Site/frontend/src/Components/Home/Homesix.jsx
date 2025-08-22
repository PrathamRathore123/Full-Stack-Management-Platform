import React, { useState, useEffect, useRef, useMemo } from 'react';
import './Homesix.css';

export default function Homesix() {
  const [activeStep, setActiveStep] = useState(0);
  const [visibleItems, setVisibleItems] = useState([]);
  const listRef = useRef(null);
  
  // Memoized data to prevent recreating on each render
  const enrollmentSteps = useMemo(() => [
    { id: 1, title: "Browse", description: "Explore our courses" },
    { id: 2, title: "Select", description: "Choose your course" },
    { id: 3, title: "Register", description: "Complete registration" },
    { id: 4, title: "Pay", description: "Process payment" },
    { id: 5, title: "Access", description: "Get your materials" },
    { id: 6, title: "Start", description: "Begin learning" }
  ], []);

  const listItems = useMemo(() => [
    { id: 1, number: "01", title: "Browse Courses", description: "Explore our catalog of courses", direction: "left" },
    { id: 2, number: "02", title: "Choose & Register", description: "Select your course and sign up", direction: "right" },
    { id: 3, number: "03", title: "Complete Payment", description: "Secure payment options available", direction: "left" },
    { id: 4, number: "04", title: "Start Learning", description: "Access course materials instantly", direction: "right" }
  ], []);

  // Animation effect to cycle through steps one by one
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev >= enrollmentSteps.length - 1 ? 0 : prev + 1));
    }, 1500);
    
    return () => clearInterval(interval);
  }, [enrollmentSteps.length]);

  // Animation effect for list items - optimized
  useEffect(() => {
    // Trigger initial animations with staggered timing
    const timer = setTimeout(() => {
      listItems.forEach((item, index) => {
        setTimeout(() => {
          setVisibleItems(prev => [...new Set([...prev, item.id])]);
        }, index * 300);
      });
    }, 500);

    // Setup intersection observer for scroll-triggered animations
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          const itemId = parseInt(entry.target.dataset.id);
          setVisibleItems(prev => [...new Set([...prev, itemId])]);
        }
      }),
      { threshold: 0.1 }
    );

    // Observe list items
    const items = listRef.current?.querySelectorAll('li') || [];
    items.forEach(item => observer.observe(item));

    return () => {
      items.forEach(item => observer.unobserve(item));
      clearTimeout(timer);
    };
  }, [listItems]);

  return (
    <div className="enrollment-wrapper">
      <div className="enrollment-header">
        <h2>How to <span>Enroll</span></h2>
        <p>Simple steps to start your learning journey</p>
      </div>
      
      <div className="enrollment-content">
        <div className="enrollment-info">
          <ul ref={listRef}>
            {listItems.map(item => (
              <li 
                key={item.id}
                data-id={item.id}
                className={`scroll-item ${item.direction} ${visibleItems.includes(item.id) ? 'visible' : ''}`}
              >
                <span className="step-number">{item.number}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
          <button className="enroll-btn">Enroll Now</button>
        </div>
        
        <div className="roadmap-visual">
          <div className="roadmap-path s-shape"></div>
          {enrollmentSteps.map(step => (
            <div 
              key={step.id} 
              className={`roadmap-node node-${step.id} ${activeStep === step.id - 1 ? 'active' : ''}`}
            >
              <div className="step-box">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              <div className={`step-circle ${activeStep === step.id - 1 ? 'animate' : ''}`}>
                {step.id}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}