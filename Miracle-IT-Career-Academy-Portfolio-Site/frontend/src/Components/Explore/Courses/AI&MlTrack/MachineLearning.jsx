import React from 'react'
import './MachineLearning.css'

export default function MachineLearning() {
  return (
    <div className="machine-learning-container">
      <h1>Machine Learning</h1>
      <p className="course-description">
        Explore our comprehensive Machine Learning curriculum designed to take you from basics to advanced concepts.
      </p>
      
      <div className="course-grid">
        <div className="course-card">
          <h3>Introduction to Machine Learning</h3>
          <p>Learn the fundamentals of machine learning algorithms and techniques.</p>
          <button className="enroll-button">Enroll Now</button>
        </div>
        
        <div className="course-card">
          <h3>Supervised Learning</h3>
          <p>Master classification and regression techniques with hands-on projects.</p>
          <button className="enroll-button">Enroll Now</button>
        </div>
        
        <div className="course-card">
          <h3>Deep Learning Fundamentals</h3>
          <p>Explore neural networks and deep learning architectures.</p>
          <button className="enroll-button">Enroll Now</button>
        </div>
      </div>
    </div>
  )
}