import React, { useEffect, useRef, useLayoutEffect } from 'react';
import './Homeone.css';
import studentImg from '../Images/Laptop.png'; // You can replace this with a URL or different image
import { gsap } from 'gsap';

const LandingPage = () => {
  const circleRef = useRef(null);
  const dashCircle1Ref = useRef(null);
  const dashCircle2Ref = useRef(null);
  const cardRefs = useRef([]);
  const imageContainerRef = useRef(null);
  const headingRef = useRef(null);
  
  // Store animation instances to kill them on cleanup
  const animationsRef = useRef([]);

  // Use useLayoutEffect to ensure animations are set up before browser paint
  useLayoutEffect(() => {
    // Clear any existing animations to prevent duplicates
    if (animationsRef.current.length) {
      animationsRef.current.forEach(anim => anim.kill());
      animationsRef.current = [];
    }
    
    // Reset the cardRefs array if component re-renders
    cardRefs.current = [];
    
    // Animation for the dashed circles - continuous rotation
    const circle1Anim = gsap.to(dashCircle1Ref.current, {
      rotation: 360,
      duration: 20,
      repeat: -1,
      ease: "none"
    });
    
    const circle2Anim = gsap.to(dashCircle2Ref.current, {
      rotation: -360,
      duration: 15,
      repeat: -1,
      ease: "none"
    });
    
    // Store animations for cleanup
    animationsRef.current.push(circle1Anim, circle2Anim);
    
    return () => {
      // Cleanup animations when component unmounts
      animationsRef.current.forEach(anim => anim.kill());
    };
  }, []);
  
  // This effect runs after the DOM is fully updated
  useEffect(() => {
    // Animation for the heading with enhanced visibility
    const headingAnim = gsap.from(headingRef.current, {
      y: 30,
      opacity: 1,
      duration: 1,
      ease: "power3.out",
      onComplete: () => {
        // Add a subtle pulse animation to draw attention to the heading
        gsap.to(headingRef.current, {
          scale: 1.02,
          duration: 1.5,
          repeat: 1,
          yoyo: true,
          ease: "power1.inOut"
        });
      }
    });
    
    // Animation for the small cards with staggered effect - only initial entrance
    cardRefs.current.forEach((card, index) => {
      const cardAnim = gsap.from(card, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        delay: 0.15 * index,
        ease: "power2.out"
      });
      animationsRef.current.push(cardAnim);
    });

    // Animation for the main image with a professional entrance
    const imageAnim = gsap.from(imageContainerRef.current, {
      scale: 0.95,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out"
    });
    
    animationsRef.current.push(headingAnim, imageAnim);
  }, []);

  // Function to add cards to the refs array
  const addToRefs = (el) => {
    if (el && !cardRefs.current.includes(el)) {
      cardRefs.current.push(el);
    }
  };

  return (
    <section className="landing-homeone">
      <div className="content-homeone">
        <div className="heading-container">
          <h1 ref={headingRef} className="main-heading-one">
            Up Your <span className="highlight">Skills</span><br />
            To <span className="highlight">Advance</span> Your<br />
            <span className="highlight">Career</span> Path
          </h1>
        </div>
        <p>
          Get hands-on training in the latest technologies and boost your professional journey with our expert-led courses.
        </p>
        <button className="btn-primary">Get Started</button>

        <div className="features-page-one">
          <div className="feature-item-one">💬 Public Speaking</div>
          <div className="feature-item-one">🎯 Career-Oriented</div>
          <div className="feature-item-one">💡 Creative Thinking</div>
        </div>

  
      </div>

      <div className="image-section" ref={imageContainerRef}>
        {/* Animated circles */}
        <div className="circle-container">
          <div className="solid-circle" ref={circleRef}></div>
          <div className="dashed-circle circle1" ref={dashCircle1Ref}></div>
          <div className="dashed-circle circle2" ref={dashCircle2Ref}></div>
        </div>
        
        <img src={studentImg} alt="Student" />
        
        <div className="badge top-left" ref={addToRefs}>📹 200+<br />Video Courses</div>
        <div className="badge top-right" ref={addToRefs}>👨‍🏫 250+<br />Tutors</div>
        <div className="badge bottom" ref={addToRefs}>📘 250+<br />Online Courses</div>
        
        {/* Additional small cards with improved positioning */}
        <div className="small-card card1" ref={addToRefs}>
          <span className="card-icon">🚀</span>
          <span className="card-text">Fast Learning</span>
        </div>
        <div className="small-card card2" ref={addToRefs}>
          <span className="card-icon">🏆</span>
          <span className="card-text">Top Rated</span>
        </div>
        <div className="small-card card3" ref={addToRefs}>
          <span className="card-icon">💻</span>
          <span className="card-text">Hands-on</span>
        </div>
        <div className="small-card card4" ref={addToRefs}>
          <span className="card-icon">🔄</span>
          <span className="card-text">Updated</span>
        </div>
      </div>
    </section>
  );
};

export default LandingPage;