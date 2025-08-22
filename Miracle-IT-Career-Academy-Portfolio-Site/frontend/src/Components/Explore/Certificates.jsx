import React, { useEffect, useState } from 'react';
import './certificate-page.css';
import { motion } from 'framer-motion';
import { fetchCertificates } from '../../api';

const Certificates = () => {
  const [loading, setLoading] = useState(true);
  const [previewCertificate, setPreviewCertificate] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        setLoading(true);
        const data = await fetchCertificates();
        setCertificates(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading certificates:', err);
        setError('Failed to load certificates. Please try again later.');
        setLoading(false);
      }
    };

    loadCertificates();

    // Animation for elements when they come into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.1 });

    // FAQ functionality
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      if (question) {
        question.addEventListener('click', () => {
          item.classList.toggle('active');
          const toggle = item.querySelector('.faq-toggle');
          if (toggle) {
            toggle.textContent = item.classList.contains('active') ? '−' : '+';
          }
        });
      }
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });

    return () => {
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  const handlePreviewCertificate = (type) => {
    setPreviewCertificate({
      type,
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      title: `${type} Certificate`,
      date: new Date().toLocaleDateString()
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Certificates...</p>
      </div>
    );
  }

  return (
    <div className="certificates-container">
      {/* Hero Section */}
      <motion.div 
        className="certificate-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="floating-shape shape1"></div>
        <div className="floating-shape shape2"></div>
        <div className="floating-shape shape3"></div>
        <motion.div 
          className="certificate-hero-content"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h1>Earn Professional Certificates</h1>
          <p>Advance your career with industry-recognized certifications that employers value worldwide</p>
          <div className="hero-buttons">
            <motion.button 
              className="hero-btn hero-btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Programs
            </motion.button>
            <motion.button 
              className="hero-btn hero-btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Certificate Paths Section */}
      <div className="certificate-paths-container">
        <div className="container-inner">
          <motion.div 
            className="section-heading animate-on-scroll"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2>Certification Pathways</h2>
            <p>Choose the learning format that best suits your needs and schedule</p>
          </motion.div>

          <div className="certificate-paths">
            {/* Online Courses Path */}
            <motion.div 
              className="path-card online-path animate-on-scroll"
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="path-header">
                <div className="path-icon">
                  <i className="fas fa-laptop"></i>
                </div>
                <h3>Online Learning</h3>
              </div>
              <div className="path-image" onClick={() => handlePreviewCertificate('Online')}>
                <img src="https://images.unsplash.com/photo-1571260899304-425eee4c7efd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Online Learning" />
                <div className="preview-overlay">
                  <span>Preview Certificate</span>
                </div>
              </div>
              <div className="path-steps">
                <div className="path-step">
                  <div className="step-marker">1</div>
                  <div className="step-content">
                    <h4>Enroll Online</h4>
                    <p>Register for our self-paced digital courses</p>
                  </div>
                </div>
                <div className="path-step">
                  <div className="step-marker">2</div>
                  <div className="step-content">
                    <h4>Complete Modules</h4>
                    <p>Study interactive content at your own pace</p>
                  </div>
                </div>
                <div className="path-step">
                  <div className="step-marker">3</div>
                  <div className="step-content">
                    <h4>Pass Assessment</h4>
                    <p>Score 70%+ on the final evaluation</p>
                  </div>
                </div>
                <div className="path-step">
                  <div className="step-marker">4</div>
                  <div className="step-content">
                    <h4>Get Certified</h4>
                    <p>Receive your digital certificate instantly</p>
                  </div>
                </div>
              </div>
              <motion.button 
                className="path-btn"
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Online Courses
              </motion.button>
            </motion.div>

            {/* Offline Courses Path */}
            <motion.div 
              className="path-card offline-path animate-on-scroll"
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="path-header">
                <div className="path-icon">
                  <i className="fas fa-chalkboard-teacher"></i>
                </div>
                <h3>Classroom Learning</h3>
              </div>
              <div className="path-image" onClick={() => handlePreviewCertificate('Classroom')}>
                <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Classroom Learning" />
                <div className="preview-overlay">
                  <span>Preview Certificate</span>
                </div>
              </div>
              <div className="path-steps">
                <div className="path-step">
                  <div className="step-marker">1</div>
                  <div className="step-content">
                    <h4>Register In-Person</h4>
                    <p>Join our instructor-led classroom sessions</p>
                  </div>
                </div>
                <div className="path-step">
                  <div className="step-marker">2</div>
                  <div className="step-content">
                    <h4>Attend Classes</h4>
                    <p>Participate in hands-on training sessions</p>
                  </div>
                </div>
                <div className="path-step">
                  <div className="step-marker">3</div>
                  <div className="step-content">
                    <h4>Complete Projects</h4>
                    <p>Build real-world applications with guidance</p>
                  </div>
                </div>
                <div className="path-step">
                  <div className="step-marker">4</div>
                  <div className="step-content">
                    <h4>Graduate</h4>
                    <p>Receive certificate at graduation ceremony</p>
                  </div>
                </div>
              </div>
              <motion.button 
                className="path-btn"
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                Find Classroom Courses
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Additional Options Section */}
      <div className="additional-options-container">
        <div className="container-inner">
          <motion.div 
            className="section-heading animate-on-scroll"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2>Additional Certification Options</h2>
            <p>Explore alternative paths to earning valuable credentials</p>
          </motion.div>

          <div className="options-grid">
            {/* Workshops */}
            <motion.div 
              className="option-tile animate-on-scroll"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="option-header">
                <div className="option-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <h3>Certified Workshops</h3>
              </div>
              <div className="option-content">
                <p>Intensive 1-3 day expert-led training sessions on specialized technologies</p>
                <ul className="option-features">
                  <li><i className="fas fa-check-circle"></i> High-impact learning</li>
                  <li><i className="fas fa-check-circle"></i> Industry networking</li>
                  <li><i className="fas fa-check-circle"></i> Focused skill development</li>
                </ul>
                <motion.button 
                  className="option-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Workshops
                </motion.button>
              </div>
            </motion.div>

            {/* Exams */}
            <motion.div 
              className="option-tile animate-on-scroll"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="option-header">
                <div className="option-icon">
                  <i className="fas fa-file-alt"></i>
                </div>
                <h3>Professional Exams</h3>
              </div>
              <div className="option-content">
                <p>Industry-standard certification exams with preparation support</p>
                <ul className="option-features">
                  <li><i className="fas fa-check-circle"></i> Global recognition</li>
                  <li><i className="fas fa-check-circle"></i> Prep materials included</li>
                  <li><i className="fas fa-check-circle"></i> Flexible scheduling</li>
                </ul>
                <motion.button 
                  className="option-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Schedule Exam
                </motion.button>
              </div>
            </motion.div>

            {/* Internships */}
            <motion.div 
              className="option-tile animate-on-scroll"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="option-header">
                <div className="option-icon">
                  <i className="fas fa-briefcase"></i>
                </div>
                <h3>Internship Certificates</h3>
              </div>
              <div className="option-content">
                <p>1-6 month work experience programs with partner companies</p>
                <ul className="option-features">
                  <li><i className="fas fa-check-circle"></i> Real-world experience</li>
                  <li><i className="fas fa-check-circle"></i> Professional mentorship</li>
                  <li><i className="fas fa-check-circle"></i> Job opportunities</li>
                </ul>
                <motion.button 
                  className="option-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Find Internships
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-container">
        <div className="container-inner">
          <motion.div 
            className="section-heading animate-on-scroll"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2>Frequently Asked Questions</h2>
            <p>Find answers to common questions about our certification programs</p>
          </motion.div>
          
          <div className="faq-grid">
            <motion.div 
              className="faq-item animate-on-scroll"
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="faq-question">
                <h3>How long are certificates valid?</h3>
                <span className="faq-toggle">+</span>
              </div>
              <div className="faq-answer">
                <p>Our certificates do not expire. However, for certain technical certifications, we recommend renewal every 2-3 years to stay current with evolving technologies.</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="faq-item animate-on-scroll"
              initial={{ x: 30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="faq-question">
                <h3>Can I get a physical certificate?</h3>
                <span className="faq-toggle">+</span>
              </div>
              <div className="faq-answer">
                <p>Yes, all digital certificates can be requested as physical copies for an additional fee. Physical certificates are printed on premium paper with embossed seals.</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="faq-item animate-on-scroll"
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="faq-question">
                <h3>Are certificates internationally recognized?</h3>
                <span className="faq-toggle">+</span>
              </div>
              <div className="faq-answer">
                <p>Yes, our certificates are designed to meet international standards and are recognized by employers worldwide.</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="faq-item animate-on-scroll"
              initial={{ x: 30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="faq-question">
                <h3>How quickly can I complete a certification?</h3>
                <span className="faq-toggle">+</span>
              </div>
              <div className="faq-answer">
                <p>Completion time varies by program. Online courses can be completed at your own pace, typically taking 4-12 weeks. Classroom courses follow a fixed schedule of 8-16 weeks.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <motion.div 
        className="cta-container"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="cta-bg-shapes">
          <div className="cta-shape cta-shape-1"></div>
          <div className="cta-shape cta-shape-2"></div>
          <div className="cta-shape cta-shape-3"></div>
        </div>
        <div className="container-inner">
          <motion.div 
            className="cta-content"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2>Ready to Advance Your Career?</h2>
            <p>Start your certification journey today and take the next step toward professional success</p>
            <motion.button 
              className="cta-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Now
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Certificate Preview Modal */}
      {previewCertificate && (
        <motion.div 
          className="certificate-preview-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="modal-content">
            <button className="close-modal" onClick={() => setPreviewCertificate(null)}>×</button>
            <h3>{previewCertificate.title}</h3>
            <div className="certificate-preview-image">
              <img src={previewCertificate.image} alt="Certificate Preview" />
            </div>
            <p>Sample certificate for {previewCertificate.type} Learning Path</p>
            <p className="certificate-date">Issue Date: {previewCertificate.date}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Certificates;