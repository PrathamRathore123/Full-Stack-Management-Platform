import React from 'react';
import { Link } from 'react-router-dom';
import './CategorySlider.css';

const CategorySlider = () => {
  const categories = [
    { name: 'Web Development', path: '/explore/courses/category/development-hub', icon: '💻' },
    { name: 'AI & Machine Learning', path: '/explore/courses/category/ai-ml-track', icon: '🤖' },
    { name: 'Cloud Computing', path: '/explore/courses/category/cloud-computing', icon: '☁️' },
    { name: 'Data Science', path: '/explore/courses/category/data-science', icon: '📊' },
    { name: 'Basic Computer Skills', path: '/explore/courses/category/basic-computer', icon: '🖥️' },
    { name: 'Mobile Development', path: '/explore/courses/category/mobile-dev', icon: '📱' },
    { name: 'Cybersecurity', path: '/explore/courses/category/security', icon: '🔒' },
    { name: 'Job-Linked Programs', path: '/explore/courses/category/job-linked', icon: '💼' },
  ];

  return (
    <div className="category-slider-container">
      <h2>Explore By Category</h2>
      <div className="category-slider">
        <div className="slider-track">
          {/* Double the items for continuous loop effect */}
          {[...categories, ...categories].map((category, index) => (
            <Link 
              to={category.path} 
              className="category-item" 
              key={index}
            >
              <div className="category-icon-wrapper">
                <span className="category-icon">{category.icon}</span>
              </div>
              <span className="category-name">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySlider;